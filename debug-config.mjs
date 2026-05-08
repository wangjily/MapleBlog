import { resolveConfig } from 'astro/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function debug() {
  try {
    const config = await resolveConfig({
      root: __dirname,
      logLevel: 'debug'
    }, 'build');

    console.log('Adapter:', config.adapter);
    console.log('Build output:', config.build?.output);
    console.log('Output mode:', config.output);
  } catch (e) {
    console.error('Error:', e);
  }
}

debug();
