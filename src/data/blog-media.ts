import manifest from './imported/blog-media-mirror.json';
const mirrored=manifest as Record<string,string>;
export function blogImageUrl(original:string):string{
 return mirrored[original]||original;
}
