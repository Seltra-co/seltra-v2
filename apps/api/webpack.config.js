const path = require('path')

module.exports = function (options) {
  return {
    ...options,
    entry: options.entry,
    externals: [],
    output: {
      ...options.output,
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
      ...options.resolve,
      alias: {
        '@seltra/ai': path.resolve(__dirname, '../../packages/ai/src/index.ts'),
        '@seltra/db': path.resolve(__dirname, '../../packages/db/src/index.ts'),
        '@seltra/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      },
      extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
          exclude: /node_modules/,
        },
      ],
    },
  }
}