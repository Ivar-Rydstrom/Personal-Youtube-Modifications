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
var loadThresholdFactor = 1;
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
    var progress = document.querySelector('yt-page-navigation-progress');
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
        // make view-count font larger
        document.querySelector('yt-view-count-renderer').style.setProperty('font-size', '1.7rem');

        // auto-expaand live chat replay box
        if (document.querySelector('ytd-live-chat-frame') != undefined && document.querySelector('ytd-live-chat-frame').attributes.hasOwnProperty('collapsed')) {
            document.querySelector('ytd-toggle-button-renderer > a > paper-button').click();
        };

        // create additional description 'show less' button
        if (document.querySelector('.lessbutton') == undefined) {
            // initialize/style lessButton, wrapper container, and inner text
            var container = document.createElement('div');
            container.style.setProperty('width', '50px');
            container.style.setProperty('position', 'absolute');
            container.style.setProperty('right', '0px');
            container.style.setProperty('top', '67px');
            container.id = 'extraExpandContainer';
            container.innerHTML = '&nbsp';
            var lessButton = document.createElement('button');
            lessButton.type = 'button';
            lessButton.style.setProperty('display', 'none');
            lessButton.style.setProperty('top', `${document.querySelector('#masthead-container').getBoundingClientRect().bottom + 5}px`);
            lessButton.style.setProperty('height', '200px');
            lessButton.style.setProperty('width', '50px');
            lessButton.style.setProperty('border', 'none');
            lessButton.style.setProperty('cursor', 'pointer');
            lessButton.classList.add('lessbuttonhover');
            var lessButtonStyle = document.createElement('style');
            var lessButtonStylesheet = '.lessbuttonhover:hover { background: rgb(170, 170, 170) }';
            lessButtonStyle.appendChild(document.createTextNode(lessButtonStylesheet));
            document.querySelector('head').appendChild(lessButtonStyle)
            lessButton.addEventListener('click', function () { // add click functionality to lessButton
                document.querySelector('paper-button#less').click();
                if (lessButton.style.position == 'fixed') {
                    document.querySelector('div#top-row.ytd-video-secondary-info-renderer').scrollIntoView();
                };
            });
            var lessText = document.createElement('div');
            lessText.innerHTML = 'SHOW LESS';
            lessText.style.setProperty('transform', 'rotate(-90deg)');
            lessText.style.setProperty('transform-origin', '33px 23.5px');
            lessText.style.setProperty('white-space', 'nowrap');
            lessText.style.setProperty('font-family', 'roboto, arial, sans-serif');
            lessText.style.setProperty('font-weight', '500');
            lessText.style.setProperty('letter-spacing', '1.6px');
            lessText.style.setProperty('word-spacing', '8px');
            lessButton.appendChild(lessText);
            var description = document.querySelector('ytd-expander');
            description.style.setProperty('display', 'inline-block');
            description.style.setProperty('margin-left', '13px');
            document.querySelector('div#container.ytd-video-secondary-info-renderer').style.setProperty('position', 'relative');
            container.appendChild(lessButton);
            document.querySelector('ytd-video-secondary-info-renderer > div#container').appendChild(container);
            var buttonEnabled = false;
            document.querySelector('paper-button#more').addEventListener('click', function() { // inject lessButton on 'show more' click
                if (document.querySelector('ytd-expander').getBoundingClientRect().height >= Number(lessButton.style.height.replace('px', ''))) {
                    lessButton.style.setProperty('position', 'unset');
                    lessButton.style.setProperty('display', 'block');
                    setButtonDisplay();
                    buttonEnabled = true;
                };
            });
            document.querySelector('paper-button#less').addEventListener('click', function() { // remove lessButton on 'show less' click
                if (lessButton.style.position == 'fixed' || container.style.bottom) {
                    document.querySelector('div#top-row.ytd-video-secondary-info-renderer').scrollIntoView();
                };
                container.style.setProperty('top', '67px');
                container.style.removeProperty('bottom');
                lessButton.style.setProperty('display', 'none');
                buttonEnabled = false;
            });
            document.addEventListener('scroll', function() { // scroll loop for fixed positioning on lessButton
                if (buttonEnabled) {
                    setButtonDisplay();
                };
            });
            var setButtonDisplay = function() { // determines and sets position and display properties for lessButton in scroll loop
                if (lessButton.getBoundingClientRect().top <= document.querySelector('ytd-expander').getBoundingClientRect().top) {
                    lessButton.style.setProperty('position', 'unset');
                    lessButton.style.setProperty('display', 'block');
                    container.style.setProperty('top', '67px');
                    container.style.removeProperty('bottom');
                } else if (lessButton.getBoundingClientRect().top <= document.querySelector('#masthead-container').getBoundingClientRect().bottom && container.style.top) {
                    lessButton.style.setProperty('position', 'fixed');
                    lessButton.style.setProperty('display', 'block');
                } else if (lessButton.getBoundingClientRect().bottom > document.querySelector('ytd-video-secondary-info-renderer > div#container').getBoundingClientRect().bottom) {
                    lessButton.style.setProperty('position', 'unset');
                    lessButton.style.setProperty('display', 'block');
                    container.style.setProperty('bottom', '0px');
                    container.style.removeProperty('top');
                } else if (lessButton.getBoundingClientRect().top > document.querySelector('#masthead-container').getBoundingClientRect().bottom && container.style.bottom) {
                    lessButton.style.setProperty('position', 'fixed');
                    lessButton.style.setProperty('display', 'block');
                };
            };
        };
        lessButton.click();

        // create expand/collapse 'Music in ths video' button if section is present
        if (document.querySelector('#musicButton') == undefined) {
            // add style to musicButton
            var musicButton = document.createElement('div');
            musicButton.id = 'musicButton';
            musicButton.style.setProperty('cursor', 'pointer');
            musicButton.style.setProperty('height', '20px');
            musicButton.style.setProperty('width', 'auto');
            musicButton.style.setProperty('display', 'none');
            musicButton.style.setProperty('position', 'absolute');
            musicButton.style.setProperty('bottom', '0px');
            musicButton.style.setProperty('right', `${Number(lessButton.style.width.replace('px', '')) + 10}px`);
            document.querySelector('ytd-expander > ytd-metadata-row-container-renderer > div#collapsible').style.display = 'none';
            musicButton.addEventListener('click', function() { // add onclick functionality to musicButton
                if (document.querySelector('ytd-expander > ytd-metadata-row-container-renderer > div#collapsible').style.display == 'none') {
                    document.querySelector('ytd-expander > ytd-metadata-row-container-renderer > div#collapsible').style.display = 'block';
                    setButtonDisplay();
                } else {
                    document.querySelector('ytd-expander > ytd-metadata-row-container-renderer > div#collapsible').style.display = 'none';
                    setButtonDisplay();
                };
            });
            var musicText = document.createElement('span');
            musicText.innerHTML = 'Music in this Video';
            musicText.style.setProperty('white-space', 'nowrap');
            musicText.style.setProperty('font-family', 'roboto, arial, sans-serif');
            musicText.style.setProperty('font-size', '1.3rem');
            musicText.style.setProperty('font-weight', '500');
            musicText.style.setProperty('letter-spacing', '0.007px');
            musicText.style.setProperty('text-transform', 'uppercase');
            musicText.style.setProperty('color', 'rgb(96,96,100)');
            musicButton.appendChild(musicText);
            // inject musicButton into description, but only display if music tracklist content is present on 'show more' click
            document.querySelector('ytd-expander > ytd-metadata-row-container-renderer').insertBefore(musicButton, document.querySelector('ytd-expander > ytd-metadata-row-container-renderer > div#collapsible'));
            document.querySelector('paper-button#more').addEventListener('click', function() {
                if (document.querySelector('ytd-expander > ytd-metadata-row-container-renderer > div#collapsible').querySelectorAll('ytd-metadata-row-renderer').length > 1) {
                    musicButton.style.setProperty('display', 'block');
                };
            });
            document.querySelector('paper-button#less').addEventListener('click', function() {
                musicButton.style.setProperty('display', 'none');
                if (document.querySelector('ytd-expander > ytd-metadata-row-container-renderer > div#collapsible').querySelectorAll('ytd-metadata-row-renderer').length > 1 && document.querySelector('ytd-expander > ytd-metadata-row-container-renderer > div#collapsible').style.display == 'block') {
                    musicButton.click();
                    lessButton.style.setProperty('display', 'none');
                };
            });
        };

        // remove annoying popups on /watch reccomended videos
        var lastReccomendedCount = 0;
        var reccomendedLoadObserver = new MutationObserver(function() {
            if (lastReccomendedCount != document.querySelector('#items.ytd-watch-next-secondary-results-renderer').querySelectorAll('ytd-compact-video-renderer').length) {
                document.querySelector('#items.ytd-watch-next-secondary-results-renderer').querySelectorAll('ytd-compact-video-renderer').forEach(function(element) {
                    element.querySelector('#hover-overlays').style.setProperty('display', 'none');
                });
            };
        });
        reccomendedLoadObserver.observe(document.querySelector('#items.ytd-watch-next-secondary-results-renderer'), {attributes: true, subtree: true});
        observers.push(reccomendedLoadObserver);

        // change video width/height
        var defaultPlayerWidth = Number(document.getElementsByClassName('html5-main-video')[0].style.getPropertyValue('width').replace('px', ''));
        var defaultPlayerHeight = Number(document.getElementsByClassName('html5-main-video')[0].style.getPropertyValue('height').replace('px', ''));
        var newVideoWidth = 900;
        var newVideoAspectRatio = 16/9;
        var newVideoHeight = newVideoWidth / newVideoAspectRatio;
        var somethingRatio = newVideoHeight/defaultPlayerHeight;

        var primaryStyle = `--ytd-watch-flexy-max-player-width:${newVideoWidth}px;--ytd-watch-flexy-max-player-height:${newVideoHeight}px;--ytd-watch-flexy-min-player-width:${newVideoWidth}px;--ytd-watch-flexy-min-player-height:${newVideoHeight}px;max-width:${newVideoWidth}px`;
        document.querySelector('#primary.ytd-watch-flexy').setAttribute('style', primaryStyle);
        var player = document.querySelector('#player.ytd-watch-flexy');
        player.style.setProperty('width', `${newVideoWidth}px`);
        player.style.setProperty('height', `${newVideoHeight}px`);
        player.style.setProperty('background-color', 'black');
        var wrapper = document.querySelector('.html5-video-player');
        wrapper.style.setProperty('width', `${newVideoWidth}px`);
        wrapper.style.setProperty('height', `${newVideoHeight}px`);
        document.querySelector('#player-container-inner').style.setProperty('padding-top', '0px');

        // // handle fullscreen mode
        // var updatedFullscreen = false;
        // var fullscreenObserver = new MutationObserver(function(mutations, fullscreenObserver) {
        //     if (true) { //!updatedFullscreen && document.querySelector('.html5-main-video').style.getPropertyValue('width') != `${screen.width}px` && false == true
        //         updatedFullscreen = true;
        //         fullscreenMode = false; // true
        //         applyVidScale();
        //     } else if (updatedFullscreen) {
        //         updatedFullscreen = false;
        //         fullscreenMode = false;
        //         applyVidScale();
        //     };
        // });
        // fullscreenObserver.observe(document.querySelector('.html5-video-player'), {attributes: true});
        // observers.push(fullscreenObserver);
        // function applyVidScale() {
        //     if (!fullscreenMode) { // standard player
        //         // rescale main video and progress bar
        //         GM_log(newVideoWidth, newVideoHeight);
        //         document.getElementsByClassName('html5-main-video')[0].style.width = `${newVideoWidth}px`;
        //         document.getElementsByClassName('html5-main-video')[0].style.height = `${newVideoHeight}px`;
        //         document.getElementsByClassName('html5-main-video')[0].style.setProperty('left', '0px');
        //         document.getElementsByClassName('ytp-chrome-bottom')[0].style.width = `${newVideoWidth - 24 + 4}px`;
        //         document.getElementsByClassName('ytp-chapter-hover-container')[0].style.width = `${newVideoWidth - 24}px`;
        
        //         // rescale all end-cards
        //         document.querySelectorAll('.ytp-ce-element').forEach(function(element) {
        //             if (element.getAttribute('orig-width') == undefined) {
        //                 element.setAttribute('orig-width', element.style.width);
        //                 element.setAttribute('orig-height', element.style.height);
        //                 element.setAttribute('orig-left', element.style.left);
        //                 element.setAttribute('orig-top', element.style.top);
        //             };
        //             element.style.width = `${element.getAttribute('orig-width').replace('px', '') * somethingRatio}px`;
        //             element.style.height = `${element.getAttribute('orig-height').replace('px', '') * somethingRatio}px`;
        //             element.style.left = `${element.getAttribute('orig-left').replace('px', '') * somethingRatio}px`;
        //             element.style.top = `${element.getAttribute('orig-top').replace('px', '') * somethingRatio}px`;
        //         });
        //     } else { // fullscreen mode
        //         // rescale main video and progress bar
        //         document.querySelector('.html5-video-player').style.setProperty('width', '100%');
        //         document.querySelector('.html5-video-player').style.setProperty('height', '100%');
        //         document.querySelector('.html5-main-video').style.setProperty('width', `${screen.width}px`);
        //         document.querySelector('.html5-main-video').style.setProperty('height', `${screen.height}px`);
        //     };
        // };
        // // applyVidScale();

        // rescale video dimentions
        function applyVidScale() {
            // rescale main video and progress bar
            GM_log(newVideoWidth, newVideoHeight);
            document.getElementsByClassName('html5-main-video')[0].style.width = `${newVideoWidth}px`;
            document.getElementsByClassName('html5-main-video')[0].style.height = `${newVideoHeight}px`;
            document.getElementsByClassName('html5-main-video')[0].style.setProperty('left', '0px');
            document.getElementsByClassName('ytp-chrome-bottom')[0].style.width = `${newVideoWidth - 24 + 4}px`;
            document.getElementsByClassName('ytp-chapter-hover-container')[0].style.width = `${newVideoWidth - 24}px`;
    
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
        };
        applyVidScale();


        // // rescale framepreview content
        // document.querySelector('.ytp-storyboard-framepreview').style.setProperty('margin', 'auto');
        // document.querySelector('.ytp-storyboard-framepreview').style.setProperty('position', 'relative');
        // document.querySelector('.ytp-storyboard-framepreview-img').style.setProperty('transform', `scale(${somethingRatio})`);
        // document.querySelector('.ytp-storyboard-framepreview-img').style.setProperty('transform-origin', 'left top');
    
        // gruesomely eradicate the picture in picture mode button
        if (document.querySelector('button.ytp-miniplayer-button')) {
            document.querySelector('button.ytp-miniplayer-button').style.setProperty('display', 'none');
        };
    
    };

    function fixWatchPlaylist() {
        // widen default collapse playlist
        document.querySelector('#expand-button').style.setProperty('width', '50px');
        // add abort playlist button
        if (document.querySelector('#abort-playlist') == undefined) {
            var abortPlaylistButton = document.createElement('div');
            abortPlaylistButton.id = 'abort-playlist';
            abortPlaylistButton.style.setProperty('cursor', 'pointer');
            abortPlaylistButton.style.setProperty('height', '60px');
            abortPlaylistButton.style.setProperty('position', 'relative');
            abortPlaylistButton.addEventListener('click', function() {
                var vidID = document.querySelector('ytd-watch-flexy').getAttribute('video-id');
                window.location.href = `https://www.youtube.com/watch?v=${vidID}`;
            });
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
            fixWatch();
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
