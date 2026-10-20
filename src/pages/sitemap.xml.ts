import {indexResponse} from '../utils/sitemap';
export function GET(){
 // Videos are intentionally omitted until their original 111 pages exist.
 return indexResponse(['/sitemap-blog.xml','/sitemap-treatments.xml','/sitemap-gallery.xml','/sitemap-pages.xml']);
}
