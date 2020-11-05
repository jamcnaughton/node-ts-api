const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const {TsConfigPathsPlugin} = require('awesome-typescript-loader');
const {resolve} = require('path');

// Set up config for workpack.
module.exports = {
  target: 'node',
  entry: resolve('packages/api/src/bin/www'),
  output: {
    crossOriginLoading: false,
    filename: 'www',
    libraryTarget: 'commonjs2',
    path: resolve('packages/api/dist/bin')
  },
  node: {
    global: true,
    crypto: true,
    __dirname: false,
    __filename: false,
    process: true,
    Buffer: true
  },
  devtool: 'source-map',
  resolve: {
    extensions: [
      '.ts',
      '.js',
      '.json'
    ],
    plugins: [
      new TsConfigPathsPlugin({
        configFileName: resolve('tsconfig.json')
      })
    ]
  },
  context: __dirname,
  plugins: [],
  module: {
    rules: [
      {
        exclude: [
          /\.(e2e-spec|spec|mock)\.ts$/
        ],
        loader: 'awesome-typescript-loader',
        query: {
          configFileName: resolve('tsconfig.json')
        },
        test: /\.ts$/
      }
    ]
  },
  externals: [
    nodeExternals()
  ]
};
