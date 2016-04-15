var React = require('react');
var ReactDOM = require('react-dom');
var wurl = require('wurl');
var SpotifyBox = require("./components/SpotifyBox");

// 取得protocal跟hostname
var protocol = wurl('protocol');
var hostname = wurl('hostname');


// 設定SpotifyBox需要的參數
var clientId    = "349685b76abc4bb6a32ed4806fd39382";
// var redirectUri = "https://follow-xxx-on-spotify-shangoyanyi.c9users.io/spotify-oauth-proxy.html";
var redirectUri = protocol + "://" + hostname + "/spotify-oauth-proxy.html"; // heroku跟cloud9的domain不同
var scope = [
  'user-read-email',
  'user-read-private',
  'user-follow-read',
  'user-follow-modify'
].join(' '); // 需要使用者授予的權限



ReactDOM.render(
  <SpotifyBox clientId={clientId} redirectUri={redirectUri} scope={scope} state="" />, 
  document.getElementById("spotifyBox")
);



