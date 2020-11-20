// ==UserScript==
// @name Personal YouTube Modifications Rewrite
// @author Ivar Rydstrom
// @match *://www.youtube.com/*
// @exclude *://www.youtube.com/embed/*
// @grant GM_log
// @run-at document-start
// ==/UserScript==


// set mutator to relaunch script on new page
var observers = []; // global mutation observer handling array
var lastPage = window.location.href;
var scriptRestartObserver = new MutationObserver(function(mutations) {
    var progress = document.querySelector('yt-page-navigation-progress');
    if (progress.getAttribute('aria-valuemax') == progress.getAttribute('aria-valuenow')) { // only reset script if progress bar is 100%
        if (window.location.href !== lastPage) {
            reset_script();
            lastPage = window.location.href;
        };
    };
});

// define reset script
function reset_script() {
    for (var i = 0; i < observers.length; i++) { // disconnect all mutation observers in handling array
        observers[i].disconnect();
    };
    observers = [];
    script(); // relaunch script
};

// define and run first-time initializer
var lazyInitializer = new MutationObserver(function(mutations, lazyInitializer) {
    if (document.querySelector('ytd-browse, ytd-watch-flexy') != undefined && document.querySelector('yt-page-navigation-progress') != undefined) {
        script();
        scriptRestartObserver.observe(document.querySelector('yt-page-navigation-progress'), {attributes: true}); // launch main mutation observer
        lazyInitializer.disconnect();
    };
});
window.addEventListener('load', function() {
    lazyInitializer.observe(document.querySelector('body'), {childList: true, subtree: true});
});



function script() {

    // define homepage script
    function fixHomepage() {
        // remove tag searchbar thing
        var tagBar = document.getElementById('chips');
        tagBar.style.display = 'none';
    
        // remove latest posts thing
        if (document.querySelector('ytd-rich-section-renderer') != undefined) {
            document.querySelectorAll('ytd-rich-section-renderer').forEach(function(section) {
                section.style.setProperty('display', 'none');
            });
        };
    
        // set videos per row to 6, width of video grid to 73% screen width, re-center grid on page
        var inputRenderWidth = 1400/1920*window.innerWidth;
        document.querySelector('ytd-rich-grid-renderer').setAttribute('style', `--ytd-rich-grid-items-per-row: 6; width: ${inputRenderWidth}px; margin: auto`);
        document.querySelector('ytd-page-manager').style.setProperty('margin-left', '200px');
    
        // make video title font size, etc smaller
        document.querySelectorAll('#video-title.ytd-rich-grid-video-renderer').forEach(function(title) {
            title.style.setProperty('font-size', '1.3rem');
            title.style.setProperty('line-height', '1.4rem');
            title.style.setProperty('font-weight', '450');
        });
    
        // make video channel name font size smaller
        document.querySelectorAll('yt-formatted-string[ellipsis-truncate] a.yt-formatted-string:last-child').forEach(function(name) {
            name.style.setProperty('font-size', '1.3rem');
        });
    
        // make more room for video title by reducing channel photo margin, adjust padding for title to use room
        document.querySelectorAll('#avatar-link.ytd-rich-grid-video-renderer').forEach(function(photo) {
            photo.style.setProperty('margin-right', '5px');
        });
        document.querySelectorAll('#meta.ytd-rich-grid-video-renderer').forEach(function(photo) {
            photo.style.setProperty('padding-right', '0px');
        });
    
        // make channel name and view count font-size smaller
        document.querySelectorAll('#metadata-line.ytd-video-meta-block').forEach(function(channel) {
            channel.style.setProperty('font-size', '1.2rem');
            channel.style.setProperty('line-height', '1.2rem');
        });
    
        // reduce vertical space between videos
        document.querySelectorAll('ytd-rich-item-renderer').forEach(function(video) {
            video.style.setProperty('margin-bottom', '0px');
            video.style.setProperty('height', '230px');
        });
    
        // remove add to playlist onhover popups
        document.querySelectorAll('#hover-overlays.ytd-thumbnail').forEach(function(hover) {
            hover.style.setProperty('display', 'none');
        });
    
        // remove rich-grid-renderer header
        if (document.querySelector('#header.ytd-rich-grid-renderer')) {
            document.querySelector('#header.ytd-rich-grid-renderer').style.setProperty('display', 'none');
        };
    };
    
    //define watch page script
    function fixWatch() {
        var newVideoWidth = 900;
        var newVideoAspectRatio = 16/9;
        var newVideoHeight = newVideoWidth / newVideoAspectRatio;
    
        // change video width/height
        var primaryStyle = `--ytd-watch-flexy-max-player-width:${newVideoWidth}px;--ytd-watch-flexy-max-player-height:${newVideoHeight}px;--ytd-watch-flexy-min-player-width:${newVideoWidth}px;--ytd-watch-flexy-min-player-height:${newVideoHeight}px;max-width:${newVideoWidth}px`;
        if (document.querySelector('#primary.ytd-watch-flexy') != undefined) {
            document.querySelector('#primary.ytd-watch-flexy').setAttribute('style', primaryStyle);
        };
        var player = document.querySelector('#player.ytd-watch-flexy');
        player.style.setProperty('width', `${newVideoWidth}px`);
        player.style.setProperty('height', `${newVideoHeight}px`);
        player.style.setProperty('background-color', 'black');
        var wrapper = document.getElementsByClassName('html5-video-player')[0];
        wrapper.style.setProperty('width', `${newVideoWidth}px`);
        wrapper.style.setProperty('height', `${newVideoHeight}px`);
        document.querySelector('#player-container-inner').style.setProperty('padding-top', '0px');
    
        // rescale framepreview content
        var somethingRatio = newVideoHeight/defaultPlayerHeight;
        document.querySelector('.ytp-storyboard-framepreview').style.setProperty('margin', 'auto');
        document.querySelector('.ytp-storyboard-framepreview').style.setProperty('position', 'relative');
        document.querySelector('.ytp-storyboard-framepreview-img').style.setProperty('transform', `scale(${somethingRatio})`);
        document.querySelector('.ytp-storyboard-framepreview-img').style.setProperty('transform-origin', 'left top');
    
        if (!fullscreenMode) { // standard player
            // rescale main video and progress bar
            document.getElementsByClassName('html5-main-video')[0].style.width = `${newVideoWidth}px`;
            document.getElementsByClassName('html5-main-video')[0].style.height = `${newVideoHeight}px`;
            document.getElementsByClassName('html5-main-video')[0].style.setProperty('left', '0px');
            // document.getElementsByClassName('ytp-chrome-bottom')[0].style.width = `${newVideoWidth - 24 + 4}px`;
            // document.getElementsByClassName('ytp-chapter-hover-container')[0].style.width = `${newVideoWidth - 24}px`;
    
            // rescale all end-cards
            document.querySelectorAll('.ytp-ce-element').forEach(function(element) {
                if (element.getAttribute('orig-width') == undefined) {
                    element.setAttribute('orig-width', element.style.width);
                    element.setAttribute('orig-height', element.style.height);
                    element.setAttribute('orig-left', element.style.left);
                    element.setAttribute('orig-top', element.style.top);
                };
                element.style.width = `${element.getAttribute('orig-width').replace('px', '') * somethingRatio}px`;
                element.style.height = `${element.getAttribute('orig-height').replace('px', '') * somethingRatio}px`;
                element.style.left = `${element.getAttribute('orig-left').replace('px', '') * somethingRatio}px`;
                element.style.top = `${element.getAttribute('orig-top').replace('px', '') * somethingRatio}px`;
            });
        } else { // fullscreen mode
            // rescale main video and progress bar
            document.querySelector('.html5-video-player').style.setProperty('width', '100%');
            document.querySelector('.html5-video-player').style.setProperty('height', '100%');
            document.querySelector('.html5-main-video').style.setProperty('width', `${screen.width}px`);
            document.querySelector('.html5-main-video').style.setProperty('height', `${screen.height}px`);
        };
    
        // gruesomely eradicate the picture in picture mode button
        if (document.querySelector('button.ytp-miniplayer-button')) {
            document.querySelector('button.ytp-miniplayer-button').style.setProperty('display', 'none');
        };
    
    };

    function fixWatchPlaylist() {
        document.querySelector('#playlist').toggleAttribute('collapsed');
        if (document.querySelector('#abort-playlist') == undefined) {
            var abortPlaylistButton = document.createElement('div');
            abortPlaylistButton.id = 'abort-playlist';
            abortPlaylistButton.style.setProperty('cursor', 'pointer');
            abortPlaylistButton.style.setProperty('height', '60px');
            abortPlaylistButton.style.setProperty('position', 'relative');
            var abortPlaylistButtonText = document.createElement('span');
            abortPlaylistButtonText.innerHTML = 'EXIT PLAYLIST';
            abortPlaylistButtonText.style.setProperty('margin', '0');
            abortPlaylistButtonText.style.setProperty('display', 'block');
            abortPlaylistButtonText.style.setProperty('position', 'relative');
            abortPlaylistButtonText.style.setProperty('top', '50%');
            abortPlaylistButtonText.style.setProperty('transform', 'translateY(-50%)');
            abortPlaylistButton.appendChild(abortPlaylistButtonText);
            document.querySelector('#header-top-row').insertBefore(abortPlaylistButton, document.querySelector('#header-top-row > #expand-button'));
        };
    };

    // determines current page type
    var pageType;
    var browseArr = document.querySelectorAll('ytd-browse, ytd-watch-flexy');
    for (var i = 0; i < browseArr.length; i ++) {
        if (browseArr[i].getAttribute('role') == 'main') {
            if (browseArr[i].hasAttribute('page-subtype')) { // ytd-browse page types
                pageType = browseArr[i].getAttribute('page-subtype');
            } else if (browseArr[i] == document.querySelector('ytd-watch-flexy')) { // watch page type
                if (document.querySelector('ytd-watch-flexy').hasAttribute('playlist')) {
                    pageType = 'watch-playlist';
                } else {
                    pageType = 'watch';
                };
            } else {
                GM_log('some weird type of page recognized prob do something about this');
            };
        };
    };
    switch(pageType) { // launches appropriate page script from pageType
        case 'home':
            GM_log('home');
            // fixHomepage();
            break;
        case 'channels':
            GM_log('channels');
            break;
        case 'watch':
            GM_log('watch');
            // fixWatch();
            break;
        case 'watch-playlist':
            GM_log('watch-playlist');
            fixWatchPlaylist();
            break;
        case 'playlist': // (playlist summary, not watch screen)
            GM_log('playlist');
            break;
        default:
            GM_log('strange pagetype recieved', pageType);
    };
    

};
