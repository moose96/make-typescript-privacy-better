import { build } from 'esbuild';
import path from 'node:path';

const outDir = 'dist';

/**
 * @type {import('esbuild').BuildOptions}
 */
const commonOptions = {
  bundle: true,
  platform: 'node',
  legalComments: 'external',
  minify: true,
  sourcemap: 'linked',
  sourcesContent: false,
  logLevel: 'info',
};

async function buildPlugin() {
  const options = {
    ...commonOptions,
    entryPoints: ['./src/plugin/index.ts'],
    external: ['ts-morph'],
  };

  await Promise.all([
    build({ ...options, format: 'cjs', outfile: path.join(outDir, 'plugin', 'index.cjs') }),
    build({ ...options, format: 'esm', outfile: path.join(outDir, 'plugin', 'index.mjs') }),
  ]);
}

async function buildWebpack() {
  await build({
    ...commonOptions,
    entryPoints: ['./src/webpack/index.ts'],
    external: ['webpack', '../plugin'],
    outfile: path.join(outDir, 'webpack', 'index.js'),
  });
}

async function buildLoaders() {
  await Promise.all([buildWebpack()]);
}

await Promise.all([buildPlugin(), buildLoaders()]);
