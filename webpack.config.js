var webpack = require('webpack');
const { CheatAngularCompilerResourcePlugin } = require('webpack-dll-ng-module-loader/plugin');

module.exports = {
  plugins: [
    new CheatAngularCompilerResourcePlugin(),
    new webpack.DllReferencePlugin({
      manifest: require('./src/dist/vendor/vendor-manifest.json')
    })
  ]
};
