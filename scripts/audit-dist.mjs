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
if (files.length < 7) throw new Error('Expected at least seven generated HTML pages; got ' + files.length);
for (const file of files) {
  const html = await readFile(file, 'utf8');
  const h1Count = (html.match(/<h1(?:\s|>)/g) || []).length;
  if (h1Count !== 1) throw new Error(file + ': expected exactly one H1, got ' + h1Count);
  if (!html.includes('<link rel="canonical"')) throw new Error(file + ': missing canonical');
  if (!html.includes('noindex,nofollow')) throw new Error(file + ': staging noindex missing');
}
console.log('SEO build audit passed for ' + files.length + ' static HTML pages.');
