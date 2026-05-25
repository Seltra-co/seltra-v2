const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = function (options) {
  return {
    ...options,
    entry: options.entry,
    externals: [
      // Don't bundle @prisma/client — let Node find it at runtime
      ({ request }, callback) => {
        if (request === '@prisma/client' || request?.startsWith('@prisma/')) {
          return callback(null, 'commonjs ' + request)
        }
        callback()
      },
    ],
    output: {
      ...options.output,
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
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
          exclude: /node_modules/,
          use: {
            loader: 'swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                  decorators: true,
                },
                transform: {
                  legacyDecorator: true,
                  decoratorMetadata: true,
                },
                target: 'es2021',
              },
              module: {
                type: 'commonjs',
              },
            },
          },
        },
      ],
    },
  }
}