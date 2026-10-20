import {gallery} from '../data/gallery';
import {sitemapResponse} from '../utils/sitemap';
export function GET(){
 return sitemapResponse(gallery.map(g=>'/gallery/'+g.slug+'/'));
}
