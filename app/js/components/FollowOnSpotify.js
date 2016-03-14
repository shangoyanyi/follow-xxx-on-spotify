var React = require("react");
var $ = require('jquery');

module.exports = React.createClass({
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
            callback.success(accessToken);
            
        }else{
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
            'user-read-private',
            'user-follow-read',
            'user-follow-modify'
            
        ]);
        
        location.href = url;
    },
    handleFollowRequest: function(id){
        console.log('handleFollowRequest triggered, id:' + id);
        
        $.ajax({
            method: "PUT",
            url: 'https://api.spotify.com/v1/me/following?type=artist&ids=' + id,
            headers: {
                'Authorization': 'Bearer ' + this.state.accessToken
            },
            success: function(){
                console.log("artist followed");
                
            }.bind(this)
        });
        
    },
    getInitialState: function(){
        return {
            accessToken: "",
            user: {status: 0, name: ""}, //0 stands for not login, 1 stands for logged in
            followingList: []
        };
    },
    componentDidMount: function(){
        this.checkLoginStatus({
            success: function(accessToken){
                // 設定accessToken
                this.setState({
                    accessToken: accessToken
                });
                
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
                
                <SearchBox user={this.state.user} accessToken={this.state.accessToken} handleFollowRequest={this.handleFollowRequest} />
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



var SearchBox = React.createClass({
    getInitialState: function(){
        return {
            artistName: "",
            searchResult: {
                id: "",
                name: "",
                image: ""
            }
        };
    },
    handleArtistNameChange: function(e) {
        this.setState({artistName: e.target.value});
        
        $.ajax({
            url: 'https://api.spotify.com/v1/search?q=' + encodeURIComponent(e.target.value) + '&type=artist&limit=1',
            headers: {
                'Authorization': 'Bearer ' + this.props.accessToken
            },
            success: function(data){
                console.log(JSON.stringify(data));
                this.setState({
                    searchResult: {
                        id: data.artists.items[0].id,
                        name: data.artists.items[0].name,
                        image: data.artists.items[0].images[2].url
                    }
                });
            }.bind(this)
        });
    },
    render: function(){
        return (
            <div>
                <p>Please enter an artist's name to search</p>
                <input type='text' value={this.state.artistName} onChange={this.handleArtistNameChange} />
                
                <div>
                    <div>
                        <img src={this.state.searchResult.image} />
                    </div>
                    <div>
                        <p>{this.state.searchResult.name}</p>
                        <p>{this.state.searchResult.id}</p>
                    </div>
                    
                    <p><button onClick={this.props.handleFollowRequest.bind(this, this.state.searchResult.id)}> Follow </button></p>
                </div>
            </div>
        );
    }
})


