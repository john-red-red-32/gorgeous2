const base='https://thegorgeousclinic.co.uk';
const esc=(v:string)=>v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export function sitemapResponse(paths:string[]):Response{
 const unique=[...new Set(paths)];
 const urls=unique.map(path=>'<url><loc>'+esc(new URL(path,base).toString())+'</loc></url>').join('\n');
 return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls+'\n</urlset>\n',
 {headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=3600'}});
}
export function indexResponse(paths:string[]):Response{
 const xml=paths.map(path=>'<sitemap><loc>'+esc(new URL(path,base).toString())+'</loc></sitemap>').join('\n');
 return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+xml+'\n</sitemapindex>\n',
 {headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=3600'}});
}
