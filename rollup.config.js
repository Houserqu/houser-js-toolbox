import rollupTypescript from 'rollup-plugin-typescript2'

export default {
  input: './src/index.ts',
  output: {
    format: 'umd',
    file: './dist/houser-tool.min.js'
  },
  sourceMap: 'inline',
  plugins: [
    rollupTypescript(),
  ]
};