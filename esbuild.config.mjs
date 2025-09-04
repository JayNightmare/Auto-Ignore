import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['src/extension.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/extension.js',
  sourcemap: true,
  external: ['vscode'],
  format: 'cjs',
  logLevel: 'info',
}).catch(() => process.exit(1));
