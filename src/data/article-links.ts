import {articles,treatments,type Article,type Treatment} from './content';

/* Conservative editorial crosslinking: treatment/topic phrases must match
 * both sides. All links point to original published article slugs.
 * Academy courses are excluded from clinic-treatment crosslinks.
 */
type Topic={id:string;treatment:RegExp;article:RegExp};
const topics:Topic[]=[
 {id:'anti-wrinkle',treatment:/anti.wrinkle|b.?tox|glabellar|frontalis|crow.s.feet|frown|gummy.smile|bunny.lines|brow.lift|chin.dimpling|downturned|masseter/,article:/anti.wrinkle|botox|b.?tox|frown|brow|forehead|jawtox|masseter/},
 {id:'lip',treatment:/lip|perioral/,article:/lip|perioral/},
 {id:'fat-dissolving',treatment:/fat.dissol|aqualyx|chin.fat|jowl.fat|body.fat/,article:/fat.dissolv|aqualyx|double.chin/},
 {id:'chemical-peels',treatment:/chemical.peel|skin.peel|depigment|active.acne.peel|resurfac/,article:/chemical.peel|peels|resurfacing|pigmentation|sun.damage|acne/},
 {id:'collagen',treatment:/collagen.induction|microneedl|cit|glass.skin/,article:/collagen|microneedl|skin.texture|acne.scars/},
 {id:'prp',treatment:/platelet.rich.plasma|prp|vampire/,article:/platelet.rich.plasma|prp|vampire.facial/},
 {id:'polynucleotides',treatment:/polynucleotide|pdrn|bio.regenerative|under.eye.bright/,article:/polynucleotide|regenerative|crepey.skin|under.eye/},
 {id:'skin-boosters',treatment:/skin.booster|profhilo|jalupro|injectable.moisturis|infini|full.face.hydration/,article:/skin.booster|profhilo|jalupro|injectable.moisturis|skin.hydrat/},
 {id:'dermal-filler',treatment:/dermal.filler|hyaluronic.acid|cheek.filler|temple|revolum|chin.filler|nose.to.mouth|jawline|rhinoplasty|filler.dissolv|midface/,article:/dermal.filler|filler|rhinoplasty|facial.volume|jawline|under.eye|temple/},
 {id:'under-eye',treatment:/under.eye|brighter.undereye|anti.fluid.retention.eyes/,article:/under.eye|dark.circle|eye.bag|crepey/},
 {id:'threads',treatment:/thread.lift|pdo|cog.thread|tightening.thread|non.surgical.face.lift/,article:/thread.lift|non.surgical.face.lift|facelift/},
 {id:'acne',treatment:/acne|subcision|scarring/,article:/acne|scars|scarring|microneedl/},
 {id:'sweating',treatment:/hyperhidro|sweat/,article:/sweating|hyperhidro/},
 {id:'hair',treatment:/hair.restor|hair.transplant/,article:/prp.hair|hair.restor|thinning.hair|hair.transplant/},
 {id:'jaw',treatment:/jaw|teeth.grinding|brux|tmj/,article:/jaw|masseter|teeth.grinding|jawtox|brux/}
];
const flat=(t:Treatment)=>([t.slug,t.name,t.category,t.childOf||''].join(' ')).toLowerCase();
const doc=(a:Article)=>(a.slug+' '+a.title).toLowerCase();
const tokenise=(s:string)=>new Set(s.toLowerCase().replace(/-\d{4,}.*$/,'').split(/[^a-z0-9]+/).filter(w=>w.length>3&&!['clinic','filler','treatment','gorgeous','blackpool','medical','skin','your','with','from','about','what','when','whether','face','treatments'].includes(w)));
export function scoreTreatmentArticle(t:Treatment,a:Article):number {
 if(a.contentType!=='Clinic')return 0;
 const source=flat(t),destination=doc(a);
 const shared=topics.filter(topic=>topic.treatment.test(source)&&topic.article.test(destination));
 if(!shared.length)return 0;
 const sourceWords=tokenise(t.name+' '+t.slug);
 const targetWords=tokenise(a.title);
 const overlap=[...sourceWords].filter(x=>targetWords.has(x)).length;
 const exact=shared.some(topic=>topic.id==='lip'||topic.id==='prp'||topic.id==='fat-dissolving');
 return shared.length*6+overlap*4+(exact?2:0);
}
export function articlesForTreatment(treatmentSlug:string,limit=5):Article[]{
 const t=treatments.find(item=>item.slug===treatmentSlug);
 if(!t)return [];
 return articles.map(a=>({a,score:scoreTreatmentArticle(t,a)}))
 .filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.a.sourceRow-b.a.sourceRow)
 .slice(0,limit).map(x=>x.a);
}
export function treatmentsForArticle(article:Article,limit=5):Treatment[]{
 return treatments.map(t=>({t,score:scoreTreatmentArticle(t,article)}))
  .filter(x=>x.score>0&&x.t.slug!=='view-our-treatments')
  .sort((a,b)=>b.score-a.score||(a.t.childOf?1:-1)||(a.t.sourceRow||0)-(b.t.sourceRow||0))
  .slice(0,limit).map(x=>x.t);
}
export function furtherReading(article:Article,limit=4):Article[]{
 const tokens=tokenise(article.title);
 return articles.filter(a=>a.slug!==article.slug&&a.contentType===article.contentType)
   .map(a=>({a,score:(a.category===article.category?6:0)+[...tokens].filter(x=>tokenise(a.title).has(x)).length*3}))
   .filter(x=>x.score>=6).sort((a,b)=>b.score-a.score||a.a.sourceRow-b.a.sourceRow)
   .slice(0,limit).map(x=>x.a);
}
