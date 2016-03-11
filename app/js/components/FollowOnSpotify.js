var React = require("react");
var $ = require('jquery');

module.exports = React.createClass({
    // loadCommentsFromServer: function() {
    //     $.ajax({
    //         url: this.props.url,
    //         dataType: 'json',
    //         cache: false,
    //         success: function(data) {
    //             this.setState({data: data});
    //         }.bind(this),
    //         error: function(xhr, status, err) {
    //             console.error(this.props.url, status, err.toString());
    //         }.bind(this)
    //     });
    // },
    // handleCommentSubmit: function(comment){
    //     $.ajax({
    //       url: this.props.url,
    //       dataType: 'json',
    //       type: 'POST',
    //       data: comment,
    //       success: function(data) {
    //         this.setState({data: data});
    //       }.bind(this),
    //       error: function(xhr, status, err) {
    //         console.error(this.props.url, status, err.toString());
    //       }.bind(this)
    //     });
    // },
    // getInitialState: function() {
    //     return {data: []};
    // },
    // componentDidMount: function() {
    //     this.loadCommentsFromServer();
    //     setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    // },
    checkLoginStatus: function(callback){
        var hash = {};
        window.location.hash.replace(/^#\/?/, '').split('&').forEach(function(kv) {
            var spl = kv.indexOf('=');
            if (spl != -1) {
                hash[kv.substring(0, spl)] = decodeURIComponent(kv.substring(spl+1));
            }
        });
            
        console.log('initial hash', JSON.stringify(hash));
        
        if ((hash.token_type == 'access_token') || (hash.token_type == 'Bearer')) {
            var accessToken = hash.access_token;
            
            // $.ajax({
            //     url: 'https://api.spotify.com/v1/me',
            //     headers: {
            //         'Authorization': 'Bearer ' + accessToken
            //     },
            //     success: function(data){
            //         console.log(JSON.stringify(data));
                    
            //         this.setState({
            //           user: {
            //                 status: 1,
            //                 name: data.email
            //             }
            //         });
            //     }.bind(this)
            // });
            
            callback.success(accessToken);
            
        }else{
            // console.log("set status to -1");
            
            // this.setState({
            //   user: {
            //         status: -1,
            //         name: ""
            //     }
            // });
            
            callback.error();
        }
    },
    handleLoginRequest: function(){
        var CLIENT_ID = '349685b76abc4bb6a32ed4806fd39382';
        var REDIRECT_URI = 'https://follow-xxx-on-spotify-shangoyanyi.c9users.io/index.html';
        
        function getLoginURL(scopes) {
            return 'https://accounts.spotify.com/authorize' + 
                '?client_id=' + CLIENT_ID +
                '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
                '&scope=' + encodeURIComponent(scopes.join(' ')) +
                '&response_type=token';
        }
        
        var url = getLoginURL([
            'user-read-email',
            'user-follow-read',
            'user-follow-modify'
        ]);
        
        location.href = url;
    },
    getInitialState: function(){
        return {
            user: {status: 0, name: ""}, //0 stands for not login, 1 stands for logged in
            followingList: []
        };
    },
    componentDidMount: function(){
        this.checkLoginStatus({
            success: function(accessToken){
                // 取得使用者資料
                $.ajax({
                    url: 'https://api.spotify.com/v1/me',
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    },
                    success: function(data){
                        console.log(JSON.stringify(data));
                        
                        this.setState({
                           user: {
                                status: 1,
                                name: data.email
                            }
                        });
                    }.bind(this)
                });
                   
                // 取得following清單
                $.ajax({
                    url: 'https://api.spotify.com/v1/me/following?type=artist',
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    },
                    success: function(data){
                        console.log(JSON.stringify(data));
                        this.setState({
                            followingList: data.artists.items
                        });
                    }.bind(this)
                });
                
            }.bind(this),
            
            error: function(){
                console.log("not login, set status to -1");
            
                this.setState({
                   user: {
                        status: -1,
                        name: ""
                    }
                });
            }.bind(this)
        });
    },
    render: function() {
        return (
            <div className="FollowOnSpotifyBox">
                <h1>Follow XXX On Spotify</h1>
                
                <SpotifyUser user={this.state.user} handleLoginRequest={this.handleLoginRequest} />
                
                <FollowingForm />
                
                <FollowingList data={this.state.followingList} />
            </div>
        );
    }
});



var SpotifyUser = React.createClass({
    render: function(){
        if(this.props.user.status == 1){
             return (
                <div>
                    <div>Hello {this.props.user.name}</div>
                </div>
            );
            
        }else if (this.props.user.status == -1){
           return (
                <div>
                    <p>Please login your Spotify Accounts</p>
                    
                    <p><button onClick={this.props.handleLoginRequest}> Login </button></p>
                </div>    
            );
            
        }else{
            return(
                <div>
                    <p>Checking Login Status...</p>
                </div>    
            );
        }
    }
});


var FollowingList = React.createClass({
    render: function(){
        var followingNodes = this.props.data.map(function(following) {
            return (
                <div key={following.id}>
                    <p>{following.name}</p>
                </div>
            );
        });
        
        return (
            <div className="followList">
                {followingNodes}
            </div>
        );
   } 
});


var FollowingForm = React.createClass({
    getInitialState: function(){
        return {
            artistName: ""
        };
    },
    handleArtistNameChange: function(e) {
        this.setState({artistName: e.target.value});
        console.log(this.state.artistName);
    },
    render: function(){
        return (
            <div>
                <input type='text' placeholder='input an artistName to follow' value={this.state.artistName} onChange={this.handleArtistNameChange} />
            </div>
        );
    }
})