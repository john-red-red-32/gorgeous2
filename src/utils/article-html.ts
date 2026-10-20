/**
 * Render Bubble's compact article BBCode safely as HTML.
 * Bubble content uses [url=...]text[/url] and occasional [b]..[/b].
 * Everything else is escaped so a section cannot inject arbitrary HTML.
 */
const escape=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
function safeUrl(raw:string):string|null{
 const val=raw.replace(/&amp;/g,'&').trim();
 try{
  const url=new URL(val,'https://thegorgeousclinic.co.uk');
  if(!['https:','http:'].includes(url.protocol))return null;
  if(url.hostname==='thegorgeousclinic.co.uk'||url.hostname==='www.thegorgeousclinic.co.uk')
   return url.pathname+url.search+url.hash;
  return url.href;
 }catch{return null;}
}
export function renderArticleBody(body:string):string{
 const input=String(body||'').replace(/\r\n?/g,'\n');
 const markers:Array<{html:string,raw:string}>=[];
 const placeholder=(html:string)=>{const key='BLOG_LINK_TOKEN_'+markers.length+'_END';markers.push({html,raw:key});return key;};
 let text=input.replace(/\[url=([^\]\n]+)\]([\s\S]*?)\[\/url\]/gi,(_,url,label)=>{
  const valid=safeUrl(url);
  const safeLabel=escape(String(label));
  return placeholder(valid?'<a href="'+escape(valid)+'"'+(valid.startsWith('/')?'':' target="_blank" rel="noopener noreferrer"')+'>'+safeLabel+'</a>':safeLabel);
 });
 text=escape(text).replace(/\[b\]([\s\S]*?)\[\/b\]/gi,'<strong>$1</strong>');
 const paras=text.split(/\n\s*\n+/).map(part=>part.trim()).filter(Boolean)
   .map(part=>'<p>'+part.replace(/\n/g,'<br>')+'</p>').join('\n');
 return markers.reduce((html,token)=>html.replaceAll(token.raw,token.html),paras);
}
export function safeReferenceUrl(raw:string):string|null{
 if(!raw?.trim())return null;
 return safeUrl(raw);
}
