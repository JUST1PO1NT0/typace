import { defineConfig, Options } from 'tsup'

const config: Options = {
  entry: { index: 'src/index.ts' },
  dts: true,
  clean: false,
  minify: true,
  sourcemap: false,
  treeshake: true,
  target: 'es2020',
  external: ['react'],
  noExternal: ['zustand'],
}

export default defineConfig([
  // CommonJS
  {
    ...config,
    format: 'cjs',
    outDir: 'dist/cjs',
    outExtension: () => ({ js: '.cjs' }),
  },
  // EcmaScript Module
  {
    ...config,
    format: 'esm',
    outDir: 'dist',
    outExtension: () => ({ js: '.mjs' }),
  },
])