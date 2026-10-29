#!/usr/bin/env node
/**
 * Capture ORIGINAL public Bubble UI after browser rendering, not source HTML.
 *
 * Produces:
 *   Full page/viewport JPEGs for desktop and mobile
 *   Gzipped final DOM for each state
 *   Style/layout/image/interactive-element inventories
 *   Playwright trace of treatment interactions
 *   One sanitized summary for auditing against Gorgeous2
 *
 * Visits only public pages and DOES NOT log in, book, submit forms, or store
 * cookies, tokens, headers, network payloads or visitor information.
 */
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {join} from 'node:path';

const BASE='https://thegorgeousclinic.co.uk';
const OUTPUT=process.env.CAPTURE_DIR||'reference-captures';
const SCENARIOS=[
 {name:'homepage',path:'/'},
 {name:'treatments',path:'/treatments/',focus:true},
 {name:'article-list',path:'/blog-posts/'},
 {name:'gallery',path:'/gallery/'},
 {name:'treatment-deep-link',path:'/treatments/anti-wrinkle-injections/'}
];
await mkdir(OUTPUT,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
const results=[];

async function settle(page){
 await page.waitForLoadState('domcontentloaded',{timeout:45000}).catch(()=>{});
 // Bubble can keep network requests open indefinitely; networkidle isn't a
 // reliable signal. Instead wait for meaningful rendered content to stabilise.
 let previous='',stable=0;
 for(let i=0;i<22;i++){
  const state=await page.evaluate(()=>{
   const el=document.body;
   return [el?.innerText?.length||0,document.documentElement.scrollHeight,
     [...document.images].filter(i=>i.complete&&i.naturalWidth>0).length].join(':');
  }).catch(()=>'');
  if(state===previous&&state.split(':')[0]>180)stable++;
  else stable=0;
  if(stable>=3)break;
  previous=state;
  await page.waitForTimeout(900);
 }
 await page.waitForTimeout(900);
}
async function scrollLoad(page){
 const height=await page.evaluate(()=>document.documentElement.scrollHeight).catch(()=>0);
 const limit=Math.min(height,18000);
 for(let y=0;y<limit;y+=620){
  await page.evaluate(v=>scrollTo(0,v),y).catch(()=>{});
  await page.waitForTimeout(90);
 }
 await page.evaluate(()=>scrollTo(0,0)).catch(()=>{});
 await page.waitForTimeout(800);
}
async function describe(page){
 return page.evaluate(()=>{
  const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);
   return r.width>2&&r.height>2&&s.display!=='none'&&s.visibility!=='hidden';};
  const st=e=>{
   const x=getComputedStyle(e);const b=e.getBoundingClientRect();
   return{
    tag:e.tagName.toLowerCase(),className:String(e.className||'').slice(0,160),
    text:(e.innerText||e.textContent||'').trim().slice(0,150),
    x:Math.round(b.left),y:Math.round(b.top),width:Math.round(b.width),height:Math.round(b.height),
    fontFamily:x.fontFamily,fontSize:x.fontSize,fontWeight:x.fontWeight,lineHeight:x.lineHeight,
    color:x.color,background:x.backgroundColor,borderRadius:x.borderRadius,
    padding:x.padding,margin:x.margin,boxShadow:x.boxShadow,
    position:x.position,zIndex:x.zIndex,display:x.display
   };
  };
  const all=[...document.querySelectorAll('a,button,input,select,textarea,[role="button"],.clickable-element')].filter(visible);
  const unique=new Set();
  const controls=all.map(e=>{
   const text=(e.innerText||e.getAttribute('aria-label')||e.getAttribute('placeholder')||'').trim().slice(0,160);
   const key=e.tagName+':'+text+':'+Math.round(e.getBoundingClientRect().top/10);
   if(unique.has(key))return null;
   unique.add(key);
   return{kind:e.tagName.toLowerCase(),text,href:e.tagName==='A'?e.getAttribute('href'):null,
     role:e.getAttribute('role'),style:st(e)};
  }).filter(Boolean).slice(0,220);
  return{
   url:location.origin+location.pathname,title:document.title,
   h1:[...document.querySelectorAll('h1')].map(e=>e.innerText),
   documentHeight:document.documentElement.scrollHeight,
   viewport:{width:innerWidth,height:innerHeight},
   visibleTextLength:document.body.innerText.length,
   controls,
   keyStyles:[...document.querySelectorAll('header,nav,h1,h2,h3,.bubble-element.Button,.bubble-element.Group,.bubble-element.Text')].filter(visible).slice(0,65).map(st),
   images:[...document.images].map(e=>({
     src:e.currentSrc||e.src,alt:e.alt||'',naturalWidth:e.naturalWidth,naturalHeight:e.naturalHeight,
     visible:visible(e)
   })).slice(0,250),
   stylesheetUrls:[...document.querySelectorAll('link[rel="stylesheet"]')].map(e=>e.href),
   fonts:[...new Set([...document.querySelectorAll('h1,h2,h3,header,button')].filter(visible).map(e=>getComputedStyle(e).fontFamily))].slice(0,30)
  };
 });
}
function namePart(s){return s.replace(/[^a-z0-9-]+/gi,'_').slice(0,70);}
async function capture(page,group,state,{doFull=true}={}){
 const key=namePart(group+'-'+state);
 const folder=join(OUTPUT,group);
 await mkdir(folder,{recursive:true});
 const screenshot=join(folder,namePart(state)+'-viewport.jpg');
 await page.screenshot({path:screenshot,quality:80,type:'jpeg',animations:'disabled',timeout:40000}).catch(e=>{
   console.warn('Screenshot failed for '+key+': '+String(e).slice(0,220));
 });
 if(doFull){
  const height=await page.evaluate(()=>document.documentElement.scrollHeight).catch(()=>100000);
  if(height<=19000){
   await page.screenshot({path:join(folder,namePart(state)+'-full.jpg'),quality:66,type:'jpeg',fullPage:true,animations:'disabled',timeout:45000}).catch(e=>console.warn('Full screenshot: '+String(e).slice(0,180)));
  }
 }
 const info=await describe(page);
 const html=await page.content();
 await writeFile(join(folder,namePart(state)+'.dom.html.gz'),gzipSync(Buffer.from(html,'utf8'),{level:7}));
 await writeFile(join(folder,namePart(state)+'.json'),JSON.stringify(info,null,2));
 return{state,url:info.url,h1:info.h1,documentHeight:info.documentHeight,
   controls:info.controls.length,images:info.images.length,fonts:info.fonts,
   domBytes:html.length,screenshot};
}
async function clickText(page,pattern){
 // Use rendered text, not Bubble's generated CSS class names. Never follow
 // booking or external links, or submit public forms.
 const loc=page.getByText(pattern).first();
 try{
  if(!(await loc.isVisible()))return {clicked:false,reason:'not visible',pattern:String(pattern)};
  const href=await loc.evaluate(e=>e.closest('a')?.getAttribute('href')||'').catch(()=>'');
  if(href && (/fresha|book|tel:|wa\.me|api\./i.test(href)||/^https?:\/\//i.test(href)&&!href.startsWith(BASE)))
   return {clicked:false,reason:'excluded external or booking',pattern:String(pattern)};
  await loc.click({timeout:7000});
  await page.waitForTimeout(1800);
  return {clicked:true,pattern:String(pattern),url:new URL(page.url()).pathname};
 }catch(e){return{clicked:false,reason:String(e).slice(0,200),pattern:String(pattern)};}
}
for(const viewport of [
 {name:'desktop',width:1440,height:900,deviceScaleFactor:1},
 {name:'mobile',width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true}
]){
 const context=await browser.newContext({viewport,
   deviceScaleFactor:1,isMobile:viewport.isMobile||false,hasTouch:viewport.hasTouch||false,
   locale:'en-GB',timezoneId:'Europe/London',ignoreHTTPSErrors:false,
   reducedMotion:'reduce',serviceWorkers:'block'});
 const page=await context.newPage();
 page.setDefaultTimeout(10000);
 const faults=[];
 page.on('pageerror',e=>{if(faults.length<20)faults.push(String(e).slice(0,250));});
 for(const scenario of SCENARIOS){
  if(viewport.name==='mobile'&&!['homepage','treatments','treatment-deep-link'].includes(scenario.name))continue;
  const group=viewport.name+'/'+scenario.name;
  try{
   const response=await page.goto(BASE+scenario.path,{waitUntil:'domcontentloaded',timeout:60000});
   await settle(page);
   await scrollLoad(page);
   const shots=[await capture(page,group,'initial')];
   const actions=[];
   if(scenario.focus){
    await context.tracing.start({screenshots:true,snapshots:true,sources:false,title:'Bubble treatment page interactions'});
    const steps=[
      {name:'concern-tab',match:/concerns|explore by concern/i},
      {name:'select-wrinkles',match:/lines\s*(?:&|and)\s*wrinkles/i},
      {name:'view-related',match:/view related treatments|find treatments|show treatments/i},
      {name:'select-treatment',match:/anti.wrinkle|botulinum toxin/i},
      {name:'price-tab',match:/price list|pricing|view prices/i}
    ];
    for(const step of steps){
     const attempt=await clickText(page,step.match);
     actions.push({step:step.name,...attempt});
     if(attempt.clicked){await settle(page);shots.push(await capture(page,group,step.name,{doFull:false}));}
    }
    await context.tracing.stop({path:join(OUTPUT,viewport.name+'-treatments-trace.zip')});
   }
   results.push({group,httpStatus:response?.status(),steps:actions,states:shots,pageErrors:faults.splice(0)});
   console.log('[capture] '+group+' HTTP '+response?.status()+' '+shots.length+' states '+shots[0].domBytes+' rendered DOM bytes');
  }catch(e){
   results.push({group,error:String(e).slice(0,400)});
   console.error('[capture failed] '+group+': '+String(e));
   await context.tracing.stop().catch(()=>{});
  }
 }
 await context.close();
}
await browser.close();
await writeFile(join(OUTPUT,'capture-summary.json'),JSON.stringify({
 capturedAt:new Date().toISOString(),source:BASE,browser:'Playwright Chromium',results
},null,2));
const successful=results.filter(x=>x.states?.length>0).length;
console.log('Captured '+successful+'/'+results.length+' page+viewport combinations.');
const treatment=results.filter(x=>x.group.endsWith('/treatments'));
console.log('Treatment interactive states: '+JSON.stringify(treatment.map(x=>({group:x.group,steps:x.steps?.map(y=>({step:y.step,clicked:y.clicked,reason:y.reason}))}))));
if(successful<5)process.exitCode=1;
