import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

async function htmlFiles(dir) {
  const files = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const target = join(dir, item.name);
    if (item.isDirectory()) files.push(...await htmlFiles(target));
    else if (item.name.endsWith('.html')) files.push(target);
  }
  return files;
}
const files = await htmlFiles('dist');
if (files.length < 19) throw new Error('Expected at least seven generated HTML pages; got ' + files.length);
for (const file of files) {
  const html = await readFile(file, 'utf8');
  const h1Count = (html.match(/<h1(?:\s|>)/g) || []).length;
  if (h1Count !== 1) throw new Error(file + ': expected exactly one H1, got ' + h1Count);
  if (!html.includes('<link rel="canonical"')) throw new Error(file + ': missing canonical');
  if (!html.includes('noindex,nofollow')) throw new Error(file + ': staging noindex missing');
}
for (const slug of ['lines-and-wrinkles','lip-volume','under-eye-hollows']) {
  const page = 'dist/concerns/'+slug+'/index.html';
  const html=await readFile(page,'utf8');
  if (!html.includes('aria-label="')) throw new Error(page+': missing accessible markup');
}
for (const slug of ['anti-wrinkle-injections','lip-enhancements']) {
  const page = 'dist/treatments/'+slug+'/index.html';
  const html=await readFile(page,'utf8');
  if (!html.includes('data-treatment-detail')) throw new Error(page+': missing independent treatment detail HTML');
}
const index=await readFile('dist/treatments/index.html','utf8');
for(const id of ['tgc-panel-concerns','tgc-panel-list','tgc-panel-consult','tgc-panel-prices']) {
  if(!index.includes(id))throw new Error('Missing treatment discovery mode: '+id);
}
console.log('SEO and discovery HTML audit passed for '+files.length+' generated pages.');
