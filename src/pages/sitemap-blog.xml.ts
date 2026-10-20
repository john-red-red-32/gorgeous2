import {articles} from '../data/content';
import {sitemapResponse} from '../utils/sitemap';
export function GET(){
 return sitemapResponse(articles.map(a=>'/blog/'+a.slug+'/'));
}
