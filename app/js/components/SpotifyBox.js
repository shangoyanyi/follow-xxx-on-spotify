var React = require("react");
var $ = require('jquery');
var wurl = require('wurl'); // a nodejs version js-url

module.exports = React.createClass({
    getInitialState: function(){
        return {
            accessToken: "",
            user: {loginStatus: false, name: ""},
            search : {text: "", type: ""},
            followingList: []
        };
    },
    
    handleLoginRequest: function(){
        var url = 'https://accounts.spotify.com/authorize' + 
                '?client_id=' + this.props.clientId +
                '&redirect_uri=' + encodeURIComponent(this.props.redirectUri) +
                '&scope=' + encodeURIComponent(this.props.scope) +
                '&response_type=token' + 
                '&state=' + encodeURIComponent(this.props.state);
        
        var width = 450,
            height = 730,
            left = (screen.width / 2) - (width / 2),
            top = (screen.height / 2) - (height / 2);
        
        var w = window.open(
                    url,
                    'Spotify',
                    'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left
                );
    },
    handleLoginRequestCallback: function(event){
        var hash = JSON.parse(event.data);
        console.log(hash);
        
        if (hash.type == 'access_token') {
             // 設定accessToken
            this.setState({
                accessToken: hash.access_token
            });
            
            // 取得使用者資料
            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + this.state.accessToken
                },
                success: function(data){
                    console.log(JSON.stringify(data));
                    this.setState({
                       user: {
                            loginStatus: true,
                            name: data.email
                        }
                    });
                }.bind(this)
            });
        }
    },
    componentDidMount: function(){
        // window.addEventListener("message", function(event) {
        //     var hash = JSON.parse(event.data);
        //     console.log(hash);
        //     if (hash.type == 'access_token') {
        //         loginRequetCallback(hash.access_token);
        //     }
        // }, false);
        
        window.addEventListener("message", this.handleLoginRequestCallback, false);
        
        
        
        
        /*
        this.checkLoginStatus({
            success: function(accessToken){
                // 設定accessToken
                this.setState({
                    accessToken: accessToken
                });
                
                
                // 取得url中查詢參數
                this.setState({
                    searchText: wurl('?artist')
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
        */
    },
    render: function() {
        if(this.state.user.loginStatus == true){
            return (
                <div className="SpotifyBox">
                    <h1>Follow XXX On Spotify</h1>
                    <div>
                        <p>Hello {this.state.user.name}</p>
                    </div> 
                </div>
            );
            
        }else{
            return (
                <div className="SpotifyBox">
                    <h1>Follow XXX On Spotify</h1>
                    
                    <div>
                        <p>Please login your Spotify Accounts</p>
                        <p><button onClick={this.handleLoginRequest}> Login </button></p>
                    </div> 
                </div>
            );
        }
    }
});


