var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');

var port = process.env.PORT;
var host = process.env.IP;

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: false,
  noInfo: false,
  historyApiFallback: true
}).listen(port, host, function (err, result) {
  if (err) {
    console.log(err);
  }
  console.log('Listening at ' + host + ":" + port);
});