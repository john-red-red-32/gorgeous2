import {treatments} from '../data/content';
import {sitemapResponse} from '../utils/sitemap';
export function GET(){
 return sitemapResponse(treatments.map(t=>'/treatments/'+t.slug+'/'));
}
