import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://thegorgeousclinic.co.uk',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' }
});
