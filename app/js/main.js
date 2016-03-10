var React = require('react');
var ReactDOM = require('react-dom');

// var Hello = require("./components/Hello");
// var CommentBox = require("./components/CommentBox");

var FollowOnSpotifyBox = require("./components/FollowOnSpotify");

/*
ReactDOM.render(
  <Hello name="Nate" />, 
  document.getElementById('content')
);

ReactDOM.render(
  <CommentBox url="https://node-express-sample-shangoyanyi.c9users.io/api/comments" pollInterval={2000} />, 
  document.getElementById('comment')
);
*/

ReactDOM.render(
  <FollowOnSpotifyBox />, document.getElementById("FollowOnSpotifyBox")
);

