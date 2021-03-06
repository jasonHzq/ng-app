var webpack = require('webpack');
var path = require('path');

module.exports = {
  mode: 'production',
  context: __dirname,
  resolve: {
    extensions: ['.js', '.jsx']
  },
  entry: {
    vendor: ['@angular/core']
  },
  output: {
    path: path.join(__dirname, './src/dist/vendor'),
    filename: 'MyDll.[name].js',
    library: '[name]_[hash]'
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, './src/dist/vendor', '[name]-manifest.json'),
      name: '[name]_[hash]'
    })
  ]
};
