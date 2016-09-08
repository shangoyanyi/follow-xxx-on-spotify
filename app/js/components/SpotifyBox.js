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
        console.log('get followingList, accessToken: ' + accessToken);
        
        var _this = this;
        
        this.setState({
            followingList:[]
        });
        
        
        var pageNumber = 1;
        
        var getNextPage = function(accessToken, url){
            console.log('get page ' + pageNumber + ' : ');
            
            $.ajax({
                url: url,
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                },
                success: function(data){
                    console.log('page ' + pageNumber + ' followingList: ' + JSON.stringify(data.artists.items));
                    
                    _this.setState({
                        followingList: _this.state.followingList.concat(data.artists.items)
                    });
                    
                    
                    console.log('next:' + JSON.stringify(data.artists.next));
                    
                    if(data.artists.next == null){
                        console.log('end of followingList');
                        
                        
                    }else{
                        console.log('have next page');
                        pageNumber++;
                        getNextPage(accessToken, data.artists.next);
                    }
                }.bind(_this)
            });
        }
        
        getNextPage(accessToken, 'https://api.spotify.com/v1/me/following?type=artist');
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
                console.log('search result: ' + JSON.stringify(data));
                
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
                
                this.getFollowingList(this.state.accessToken);
            }.bind(this)
        });
    },
    handleUnfollowRequest: function(e){
        console.log('following itemId: ' + e.target.value);
        
        $.ajax({
            method: "DELETE",
            url: 'https://api.spotify.com/v1/me/following?type=artist&ids=' + e.target.value,
            headers: {
                'Authorization': 'Bearer ' + this.state.accessToken
            },
            success: function(){
                console.log("artist unfollowed");
                
                this.getFollowingList(this.state.accessToken);
            }.bind(this)
        });
    },
    componentDidMount: function(){
        // login message listener
        window.addEventListener("message", this.handleLoginRequestCallback, false);
    },
    render: function() {
        var styles = {
          loginButton:{
              border: 'none',
              backgroundColor: '#2EBD59',
              fontSize: '1.25em',
              padding: '10px',
              borderRadius: '10px',
              color: '#ffffff',
              cursor: 'pointer'
          }  
        };
        
        if(this.state.user.loginStatus == false){
            return (
                <div className="SpotifyBox">
                    <h1>Follow XXX On Spotify</h1>
                    
                    <div>
                        <p>Please login your Spotify Accounts</p>
                        <p><button onClick={this.handleLoginRequest} style={styles.loginButton}> Login </button></p>
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
                    <SearchBox handleSearchInputChanged={this.handleSearchInputChanged} searchResult={this.state.searchResult} followingList={this.state.followingList} handleFollowRequest={this.handleFollowRequest} handleUnfollowRequest={this.handleUnfollowRequest}/>
                    
                    <hr/>
                    <FollowingList data={this.state.followingList} handleUnfollowRequest={this.handleUnfollowRequest} />
                </div>
            );
        }
    }
});



var SearchBox = React.createClass({
    render: function(){
        var styles = {
            inputBox: {
                width: '100%',
                padding: '10px',
                fontSize: '1.25em',
                backgroundColor: '#e5e5e5',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: '1px solid #aaa'
            },
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
            btnUnfollow: {
                padding: '5px',
                margin: '10px',
                backgroundColor : 'transparent',
                color: '#ffffff',
                border: '1px solid #ffffff',
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
        var handleUnfollowRequest = this.props.handleUnfollowRequest;
        
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
                                <button onClick={handleUnfollowRequest} value={item.id} style={styles.btnUnfollow}>unfollow</button>
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
                <div><input type='text' placeholder='please enter search text' onChange={this.props.handleSearchInputChanged} style={styles.inputBox}/></div>
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
            btnUnfollow: {
                padding: '5px',
                margin: '10px',
                backgroundColor : 'transparent',
                color: '#ffffff',
                border: '1px solid #ffffff',
                borderRadius: '4px',
                cursor:'pointer'
            },
            clearfix: {
                clear: 'both'
            }
        };
        
        
        var handleUnfollowRequest = this.props.handleUnfollowRequest;

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
                        <p style={styles.followingItemNameTitle}> 
                            {item.name} 
                            <button onClick={handleUnfollowRequest} value={item.id} style={styles.btnUnfollow}>unfollow</button>
                        </p>
                        <p><a href={item.external_urls.spotify} target='_blank' style={styles.followingItemNameHref}><img src='http://pennstateliveshere.psu.edu/images/play-btn.png'/></a></p>
                    </div>
                    <div style={styles.clearfix}></div>
                </div>
            );
        });
        
        return (
            <div>
                <h3>Now Following ({this.props.data.length}) </h3>
                {listItem}
            </div>
        );
   } 
});


