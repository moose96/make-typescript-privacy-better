import * as path from 'node:path';
import webpack from 'webpack';

const config: webpack.Configuration = {
  mode: 'none',
  entry: './src/tests/example.ts',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['ts-loader', './src/webpack/loader.ts'],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
};

export default config;
