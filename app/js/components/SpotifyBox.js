var React = require("react");
var $ = require('jquery');
var wurl = require('wurl'); // a nodejs version js-url

module.exports = React.createClass({
    getInitialState: function(){
        return {
            accessToken: "",
            user: {
                loginStatus: false, 
                name: ""
            },
            followingList: [],
            search : {
                type: "artist",
                text: ""
            },
            searchResult : []
            
        };
    },
    handleLoginRequest: function(){
        var url = function(clientId, redirectUri, scope, state){
            return 'https://accounts.spotify.com/authorize' + 
                '?client_id=' + clientId +
                '&redirect_uri=' + encodeURIComponent(redirectUri) +
                '&scope=' + encodeURIComponent(scope) +
                '&response_type=token' + 
                '&state=' + encodeURIComponent(state);
        }
        
        var style = function(width, height, top, left){
            return 'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left;
        }
        
        var width = 450,
            height = 730,
            left = (screen.width / 2) - (width / 2),
            top = (screen.height / 2) - (height / 2);
                
        window.open(
            url(this.props.clientId, this.props.redirectUri, this.props.scope, this.props.state), 
            'Spotify', 
            style(width, height, left, top) 
        );
    },
    handleLoginRequestCallback: function(event){
        var hash = JSON.parse(event.data);
        // console.log(hash);
        
        if (hash.type == 'access_token') {
             // 設定accessToken
            this.setState({
                user : {loginStatus: true},
                accessToken: hash.access_token
            });
            
            // 取得使用者資料
            this.getUserProfile(this.state.accessToken);
            
            // 取得following清單
            this.getFollowingList(this.state.accessToken);
        }
    },
    getUserProfile: function(accessToken){
        $.ajax({
            url: 'https://api.spotify.com/v1/me',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            success: function(data){
                // console.log(JSON.stringify(data));
                this.setState({
                    user: {
                        name: data.email
                    }
                });
            }.bind(this)
        });
    },
    getFollowingList: function(accessToken){
        $.ajax({
            url: 'https://api.spotify.com/v1/me/following?type=artist',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            success: function(data){
                this.setState({
                    followingList: data.artists.items
                });
            }.bind(this)
        });
    },
    handleSearchInputChanged: function(e){
        this.setState({
            search: {
                type: this.state.search.type,
                text: e.target.value
            }
        });
        
        this.getSearchResult(this.state.accessToken, this.state.search.type, e.target.value);
    },
    getSearchResult: function(accessToken, searchType, searchText){
        console.log('search condition: ' + searchType + ',' + searchText);
        
        $.ajax({
            url: 'https://api.spotify.com/v1/search?q=' + encodeURIComponent(searchText) + '&type=' + encodeURIComponent(searchType) + '&limit=10',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            success: function(data){
                console.log(JSON.stringify(data));
                
                this.setState({
                   searchResult: data.artists.items 
                });
            }.bind(this)
        });
    },
    handleFollowRequest: function(e){
        console.log('following itemId: ' + e.target.value);
        
        $.ajax({
            method: "PUT",
            url: 'https://api.spotify.com/v1/me/following?type=artist&ids=' + e.target.value,
            headers: {
                'Authorization': 'Bearer ' + this.state.accessToken
            },
            success: function(){
                console.log("artist followed");
                
                this.getSearchResult(this.state.accessToken, this.state.search.type, this.state.search.text); // refresh search result
            }.bind(this)
        });
        
    },
    componentDidMount: function(){
        // login message listener
        window.addEventListener("message", this.handleLoginRequestCallback, false);
        
        // initial search
        if(this.state.user.loginStatus == true){
            this.getSearchResult(this.state.accessToken, this.state.search.type, this.state.search.text);
        }
        
        // pollRequest
        if(this.state.user.loginStatus == true){
             setInterval(this.getFollowingList(this.state.accessToken), 2000);
        }
    },
    render: function() {
        if(this.state.user.loginStatus == false){
            return (
                <div className="SpotifyBox">
                    <h1>Follow XXX On Spotify</h1>
                    
                    <div>
                        <p>Please login your Spotify Accounts</p>
                        <p><button onClick={this.handleLoginRequest}> Login </button></p>
                    </div>
                </div>
            );
            
        }else{
            return (
                <div className="SpotifyBox">
                    <h1>Follow XXX On Spotify</h1>
                    
                    <div>
                        <p>Hello {this.state.user.name}</p>
                    </div>
                    
                    <hr/>
                    <SearchBox handleSearchInputChanged={this.handleSearchInputChanged} searchResult={this.state.searchResult} followingList={this.state.followingList} handleFollowRequest={this.handleFollowRequest} />
                    
                    <hr/>
                    <FollowingList data={this.state.followingList} />
                </div>
            );
        }
    }
});



var SearchBox = React.createClass({
    render: function(){
        var styles = {
            searchResultItemContainer : {
                width: 'auto',
                padding: '5px',
                margin: '5px',
                border: '1px solid #eeeeee',
                backgroundColor: '#222222'
            },
            searchResultItemPhoto: {
                float: 'left',
                padding: '5px'
            },
            searchResultItemPhotoImage: {
                width: '150px'
            },
            searchResultItemName: {
                float: 'left',
                padding: '5px'
            },
            searchResultItemNameTitle: {
                color: '#ffffff',
                fontSize: '1.5em',
                fontWeight: 'bold'
            },
            searchResultItemNameText: {
                color: '#ffffff'
            },
            searchResultItemNameHref: {
                textDecoration: 'none',
                color: '#ffffff',
                padding: '5px',
            },
            btnFollow: {
                padding: '5px',
                margin: '10px',
                backgroundColor : 'transparent',
                color: '#ffffff',
                border: '1px solid #fff',
                borderRadius: '4px',
                cursor:'pointer'
            },
            tagFollowing: {
                padding: '5px',
                margin: '10px',
                backgroundColor : '#00DD77',
                fontSize: '1rem',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px'
            },
            clearfix: {
                clear: 'both'
            }
        };
       
        // 接props物件 讓map可使用
        var followingList = this.props.followingList;
        var handleFollowRequest = this.props.handleFollowRequest;
        
        
        var searchResultItem = this.props.searchResult.map(function(item){
            console.log(JSON.stringify(item));
            
            // 檢查是否已追蹤
            var isFollowingList = followingList.filter(function(element, index, array){
                if(element.id == item.id){
                    return true;
                }
            });
            
            // 設定預設圖片路徑
            var imageUrl = 'https://lh3.googleusercontent.com/UrY7BAZ-XfXGpfkeWg0zCCeo-7ras4DCoRalC_WXXWTK9q5b0Iw7B0YQMsVxZaNB7DM=w300';
            
            if(item.images.length > 0){
                imageUrl = item.images[0].url;
            }
            
            
            if(isFollowingList.length > 0){
                return(
                    <div key={item.id} className='searchResultItemContainer' style={styles.searchResultItemContainer} >
                        <div className='searchResultItemPhoto' style={styles.searchResultItemPhoto} ><img src={imageUrl} alt={item.name} style={styles.searchResultItemPhotoImage} /></div>
                        <div className='searchResultItemName' style={styles.searchResultItemName} > 
                            <p style={styles.searchResultItemNameTitle}> 
                                {item.name}
                                <span style={styles.tagFollowing}>following</span>
                            </p>
                            <p>
                                <a href={item.external_urls.spotify} target='_blank' style={styles.searchResultItemNameHref}><img src='http://pennstateliveshere.psu.edu/images/play-btn.png'/></a>
                            </p>
                        </div>
                        <div style={styles.clearfix}></div>
                    </div>
                );
                
            }else{
                return(
                    <div key={item.id} className='searchResultItemContainer' style={styles.searchResultItemContainer} >
                        <div className='searchResultItemPhoto' style={styles.searchResultItemPhoto} ><img src={imageUrl} alt={item.name} style={styles.searchResultItemPhotoImage} /></div>
                        <div className='searchResultItemName' style={styles.searchResultItemName} > 
                            <p style={styles.searchResultItemNameTitle}> 
                                {item.name}
                                <button onClick={handleFollowRequest} value={item.id} style={styles.btnFollow}>follow</button>
                            </p>
                            <p>
                                <a href={item.external_urls.spotify} target='_blank' style={styles.searchResultItemNameHref}><img src='http://pennstateliveshere.psu.edu/images/play-btn.png'/></a>
                            </p>
                        </div>
                        <div style={styles.clearfix}></div>
                    </div>
                );
            }
        });
        
        
        return (
            <div>
                <h3>Search Now!</h3>
                <div><input type='text' placeholder='please enter search text' onChange={this.props.handleSearchInputChanged}/></div>
                <h4>Search Result</h4>
                {searchResultItem}
            </div>
        );
    }
});




var FollowingList = React.createClass({
    render: function(){
        var styles = {
            followingItemContainer : {
                width: 'auto',
                padding: '5px',
                margin: '5px',
                border: '1px solid #eeeeee',
                backgroundColor: '#222222'
            },
            followingItemPhoto: {
                float: 'left',
                padding: '5px'
            },
            followingItemPhotoImage: {
                width: '150px'
            },
            followingItemName: {
                float: 'left',
                padding: '5px'
            },
            followingItemNameTitle: {
                color: '#ffffff',
                fontSize: '1.5em',
                fontWeight: 'bold'
            },
            followingItemNameText: {
                color: '#ffffff'
            },
            followingItemNameHref: {
                textDecoration: 'none',
                color: '#ffffff',
                padding: '5px',
            },
            clearfix: {
                clear: 'both'
            }
        };
        

        var listItem  = this.props.data.map(function(item){
            // console.log(JSON.stringify(item));
            
            // 設定預設圖片路徑
            var imageUrl = 'https://lh3.googleusercontent.com/UrY7BAZ-XfXGpfkeWg0zCCeo-7ras4DCoRalC_WXXWTK9q5b0Iw7B0YQMsVxZaNB7DM=w300';
            
            if(item.images.length>0){
                imageUrl = item.images[0].url;
            }
            
            return(
                <div key={item.id} className='followingItemContainer' style={styles.followingItemContainer} >
                    <div className='followingItemPhoto' style={styles.followingItemPhoto} ><img src={imageUrl} alt={item.name} style={styles.followingItemPhotoImage} /></div>
                    <div className='followingItemName' style={styles.followingItemName} > 
                        <p style={styles.followingItemNameTitle}> {item.name} </p>
                        <p><a href={item.external_urls.spotify} target='_blank' style={styles.followingItemNameHref}><img src='http://pennstateliveshere.psu.edu/images/play-btn.png'/></a></p>
                    </div>
                    <div style={styles.clearfix}></div>
                </div>
            );
        });
        
        return (
            <div>
                <h3>Now Following</h3>
                {listItem}
            </div>
        );
   } 
});


