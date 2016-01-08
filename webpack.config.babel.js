import webpack from 'webpack'

module.exports = {
  context: __dirname + '/src',
  entry: './main.js',
  output: {
    filename: '[name].js',
  },
  module: {
    loaders: [
      {
        test:/\.js$/,
        loaders: ['babel-loader'],
      },
    ],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
  ],
}
