var React = require('react');
var ReactDOM = require('react-dom');

// var FollowOnSpotify = require("./components/FollowOnSpotify");
var SpotifyBox = require("./components/SpotifyBox");


// ReactDOM.render(
//   <FollowOnSpotify />, 
//   document.getElementById("content")
// );


var clientId    = "349685b76abc4bb6a32ed4806fd39382";
var redirectUri = "https://follow-xxx-on-spotify-shangoyanyi.c9users.io/spotify-oauth-proxy.html";
var scope = [
  'user-read-email',
  'user-read-private',
  'user-follow-read',
  'user-follow-modify'
].join(' ');



ReactDOM.render(
  <SpotifyBox clientId={clientId} redirectUri={redirectUri} scope={scope} state="" />, 
  document.getElementById("spotifyBox")
);



