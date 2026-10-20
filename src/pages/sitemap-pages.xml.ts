import {concerns} from '../data/catalogue';
import {sitemapResponse} from '../utils/sitemap';
export function GET(){
 return sitemapResponse(['/','/treatments/','/gallery/','/blog-posts/','/contact-us/',...concerns.map(c=>'/concerns/'+c.slug+'/')]);
}
