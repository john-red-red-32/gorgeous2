/**
 * Cloudflare Pages Function: opt-in educational virtual consultation.
 *
 * This endpoint is OFF by default. To activate, set both of these encrypted
 * Cloudflare Pages environment variables for the production deployment:
 *   CONSULTATION_ENABLED = true
 *   OPENAI_API_KEY = <key>
 *
 * There is no API call or charge when not enabled.
 * The default guided consultation in /public/discovery.js works offline.
 *
 * This feature handles text only; microphone and photographs can be integrated
 * later, without putting API credentials into browser JavaScript.
 */
import {treatments} from '../../src/data/content';
import {concerns} from '../../src/data/catalogue';

interface Env { OPENAI_API_KEY?:string; OPENAI_MODEL?:string; CONSULTATION_ENABLED?:string; }
interface Context { request:Request; env:Env; }
const allowedSlug=new Set(treatments.map(t=>t.slug));
const schema={
  type:'object',additionalProperties:false,
  required:['reply','follow_up_question','treatment_slugs'],
  properties:{
    reply:{type:'string',description:'Clear educational guidance. Acknowledge uncertainty and explain distinctions among concerns.'},
    follow_up_question:{type:['string','null'],description:'One useful clarifying question when necessary; otherwise null.'},
    treatment_slugs:{type:'array',items:{type:'string'},maxItems:4,description:'Only slugs from the supplied treatment catalogue.'}
  }
};
function respond(data:unknown,status=200) {
 return new Response(JSON.stringify(data),{
  status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}
 });
}
export async function onRequestPost({request,env}:Context):Promise<Response>{
 if(env.CONSULTATION_ENABLED!=='true'||!env.OPENAI_API_KEY)
  return respond({error:'Virtual consultation AI is not enabled on this deployment.'},503);
 // Pages functions are served only for this same-origin website.
 const origin=request.headers.get('Origin');
 if(origin){
  let allowed=false;
  try{ allowed=new URL(origin).hostname===new URL(request.url).hostname; }catch{}
  if(!allowed)return respond({error:'Origin not allowed'},403);
 }
 const size=Number(request.headers.get('Content-Length')||0);
 if(size>8000)return respond({error:'Message too long'},413);
 let data:any;
 try{data=await request.json();}catch{return respond({error:'Invalid JSON'},400);}
 if(data?.consent!==true) return respond({error:'Consent is required before sending a message to the AI service.'},400);
 if(typeof data.message!=='string'||data.message.trim().length<2||data.message.length>700)
  return respond({error:'Please provide a concern in no more than 700 characters.'},400);
 const history=Array.isArray(data.history)?data.history.slice(-6).filter((h:any)=>
    (h?.role==='user'||h?.role==='assistant')&&typeof h.content==='string'&&h.content.length<=700):[];
 const catalogue=treatments.filter(t=>t.slug!=='view-our-treatments').map(t=>({
  slug:t.slug,name:t.name,category:t.category,summary:t.summary,relatedSectionHeadings:(t.sections||[]).slice(0,5).map(s=>s.title)
 }));
 const concernInfo=concerns.map(c=>({name:c.name,description:c.description,treatmentSlugs:c.treatmentSlugs}));
 const instructions=[
  'You are the Gorgeous Clinic virtual educational assistant. Follow the clinic-first approach:',
  'Education before selling, transparent explanations, natural-looking aesthetic outcomes and holistic skin health.',
  'Provide general information only, never diagnose, prescribe injections or assert that a person needs a procedure.',
  'Explain differences between skin texture, muscle movement, loss of facial volume and swelling when relevant.',
  'Ask one concise clarifying question when the cause is unclear.',
  'Do not invent prices, treatment availability, practitioner recommendations or session counts.',
  'Use only supplied treatment slugs; no more than four and only when reasonably relevant.',
  'Never imply a photo or physical examination has been performed.',
  'The clinic offers in-person free consultations; a clinician may reach a different conclusion.',
  'Avoid collecting identifying/medical-history information unless essential for general education.',
  'If the user describes severe, sudden or dangerous symptoms, prioritize appropriate urgent medical attention rather than an aesthetics treatment.',
  'Write warm concise UK English without generic corporate slogans.',
  'TREATMENT CATALOGUE JSON: '+JSON.stringify(catalogue),
  'CONCERN INDEX JSON: '+JSON.stringify(concernInfo)
 ].join('\n');
 const messages=[...history.map((h:any)=>({role:h.role,content:h.content})),{role:'user',content:data.message.trim()}];
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),25000);
 try{
  const response=await fetch('https://api.openai.com/v1/responses',{
    method:'POST',signal:controller.signal,
    headers:{'Authorization':'Bearer '+env.OPENAI_API_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({
      model:env.OPENAI_MODEL||'gpt-5-mini',
      instructions,
      input:messages,
      max_output_tokens:1200,
      text:{format:{type:'json_schema',name:'gorgeous_guidance',strict:true,schema}},
      store:false
    })
  });
  if(!response.ok)return respond({error:'Guidance is temporarily unavailable. Please try the regular concern selector.'},502);
  const result:any=await response.json();
  const output=result.output?.flatMap((item:any)=>item.content||[]).find((item:any)=>item.type==='output_text')?.text;
  if(typeof output!=='string')return respond({error:'No guidance returned.'},502);
  const value=JSON.parse(output);
  const slugs=[...new Set((Array.isArray(value.treatment_slugs)?value.treatment_slugs:[]).filter((id:any)=>typeof id==='string'&&allowedSlug.has(id)))].slice(0,4);
  return respond({reply:String(value.reply||'').slice(0,2500),
    follow_up_question:typeof value.follow_up_question==='string'?value.follow_up_question.slice(0,350):null,
    treatments:slugs.map(id=>{const t=treatments.find(v=>v.slug===id)!;return{slug:t.slug,name:t.name,summary:t.summary,url:'/treatments/'+t.slug+'/'}})});
 }catch{
  return respond({error:'Guidance is temporarily unavailable. You can still explore treatments manually.'},502);
 }finally{clearTimeout(timeout);}
}
export function onRequestGet():Response{
 return respond({enabled:false,message:'This private endpoint accepts consented POST requests only.'},405);
}
