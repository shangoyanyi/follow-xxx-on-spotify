var webpack = require("webpack");


module.exports = {
  entry:[
    //'webpack-dev-server/client?https://react-webpack-sample-shangoyanyi.c9users.io', // WebpackDevServer host and port
    //'webpack/hot/only-dev-server',
    './app/js/main.js'
  ],
  output: {
    path: __dirname + '/assets/',
    publicPath: "/assets/",
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
        test: /\.js$/,
        exclude: /node_modules/,
        //loader: 'react-hot!jsx-loader?harmony'
        // loader: 'jsx-loader?harmony'
        loader: 'babel-loader',
        query: {
            presets: ['es2015', 'react']
        }
    }]
  }
};