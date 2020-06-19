// ==UserScript==
// @name Personal YouTube Modifications
// @author Ivar Rydstrom
// @match *://www.youtube.com/*
// @exclude *://www.youtube.com/embed/*
// @grant GM_log
// @run-at document-start
// ==/UserScript==

var newVideoWidth = 900;
var newVideoAspectRatio = 16/9;
var newVideoHeight = newVideoWidth / newVideoAspectRatio;

var startedHomepage = false;
var startedWatch = false;
var urlUpdated = false;
var gridCount;
var lastArgs;
var lastVidSrc;
var oldVideoChapterWidth;
var startedForceChapterWidth = false;

// various changes to the YouTube Homepage layout
function fixHomepage() {
    // remove tag searchbar thing
    var tagBar = document.getElementById('chips-below');
    tagBar.style.display = 'none';

    // remove latest posts thing
    if (document.querySelector('ytd-rich-section-renderer') != undefined) {
        document.querySelectorAll('ytd-rich-section-renderer').forEach(function(section) {
            section.style.setProperty('display', 'none');
        });
    };

    // set videos per row to 6, width of video grid to 1400px, app drawer width to 200px, re-center grid on page
    document.querySelector('ytd-rich-grid-renderer').setAttribute('style', '--ytd-rich-grid-items-per-row: 6; width: 1400px; margin: auto');
    document.querySelector('ytd-app').style.setProperty('--app-drawer-width', '200px');
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

    // reduce margin-right on app drawer icons
    document.querySelectorAll('yt-img-shadow.ytd-guide-entry-renderer').forEach(function(icon) {
        icon.style.setProperty('margin-right', '8px');
    });
    document.querySelectorAll('.guide-icon.ytd-guide-entry-renderer').forEach(function(icon) {
        icon.style.setProperty('margin-right', '8px');
    });

    // remove add to playlist onhover popups
    document.querySelectorAll('#hover-overlays.ytd-thumbnail').forEach(function(hover) {
        hover.style.setProperty('display', 'none');
    });
};

var startedChapterBlocks = false;
function fixWatch() {
    // change video width/height
    var defaultPlayerWidth = Number(document.getElementsByClassName('html5-main-video')[0].style.getPropertyValue('width').replace('px', ''));
    var defaultPlayerHeight = Number(document.getElementsByClassName('html5-main-video')[0].style.getPropertyValue('height').replace('px', ''));
    var scaleRatio = newVideoWidth/defaultPlayerWidth;
    var newPlayerHeight = defaultPlayerHeight*scaleRatio;

    var primaryStyle = `--ytd-watch-flexy-max-player-width:${newVideoWidth}px;--ytd-watch-flexy-max-player-height:${newVideoHeight}px;--ytd-watch-flexy-min-player-width:${newVideoWidth}px;--ytd-watch-flexy-max-player-height:${newVideoHeight}px;`;
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

    document.getElementsByClassName('html5-main-video')[0].style.width = `${newVideoWidth}px`;
    document.getElementsByClassName('html5-main-video')[0].style.height = `${newVideoHeight}px`;
    document.getElementsByClassName('ytp-chrome-bottom')[0].style.width = `${newVideoWidth - 24}px`;
    document.getElementsByClassName('ytp-chapter-hover-container')[0].style.width = `${newVideoWidth - 24}px`;

    // rescale chapter blocks if present
    var chapterBlocks = new MutationObserver(function(mutations, observer) {
        var correctFirstWidth;
        function setNewChapterWidths() {
            if (document.querySelector('.ytp-chapters-container').querySelectorAll('.ytp-chapter-hover-container').length > 1) {
                var chapterScaleRatio = (newVideoWidth - 24)/oldVideoChapterWidth;
                GM_log('ratio: ',chapterScaleRatio);
                document.querySelector('.ytp-chapters-container').querySelectorAll('.ytp-chapter-hover-container').forEach(function(chapter) {
                    var chapterWidth = Math.round(Number(chapter.style.getPropertyValue('width').replace('px', ''))*chapterScaleRatio);
                    chapter.style.setProperty('width', `${chapterWidth}px`);
                });
                document.querySelector('.ytp-chapters-container').querySelector('.ytp-chapter-hover-container').style.setProperty('display', 'none');
                correctFirstWidth = Number(document.querySelector('.ytp-chapters-container').querySelector('.ytp-chapter-hover-container').style.getPropertyValue('width').replace('px', ''));
                observer.disconnect();
            };
        };
        setNewChapterWidths();
        // correct if chapter widths revert or are updated
        if (!startedForceChapterWidth) {
            startedForceChapterWidth = true;
            var forceChapterWidth = new MutationObserver(function() {
                if (correctFirstWidth != Number(document.querySelector('.ytp-chapters-container').querySelector('.ytp-chapter-hover-container').style.getPropertyValue('width').replace('px', ''))) {
                    GM_log('forced');
                    setNewChapterWidths();
                };
            });
            forceChapterWidth.observe(document.querySelector('.ytp-chapters-container'), {attributes: true, subtree: true});
        };
    });
    if (urlUpdated) {
        chapterBlocks.observe(document.querySelector('.ytp-chapters-container'), {attributes: true, subtree: true})
    };
    if (!startedChapterBlocks) {
        startedChapterBlocks = true;
        chapterBlocks.observe(document.querySelector('.ytp-chapters-container'), {attributes: true, subtree: true})
    };
    // correct if video has no chapters
    if (document.querySelector('.ytp-chapters-container').querySelectorAll('.ytp-chapter-hover-container').length == 1) {
        document.querySelector('.ytp-chapters-container').querySelector('.ytp-chapter-hover-container').style.removeProperty('display');
    };

};


function initHomepage () {
    if (window.location.href == 'https://www.youtube.com/') {
        gridCount = document.querySelectorAll('ytd-rich-item-renderer').length;
        fixHomepage();
        var observer = new MutationObserver(function(mutations) {
            // preload LOTS of videos (more usable with 6-vids across)
            if (!document.querySelector('ytd-rich-grid-renderer').getAttribute('style').includes('--ytd-rich-grid-items-per-row: 20') && document.querySelectorAll('ytd-rich-item-renderer').length < 40) {
                document.querySelector('ytd-rich-grid-renderer').setAttribute('style', '--ytd-rich-grid-items-per-row: 20');
                startedHomepage = true;
            };
            if (!document.querySelector('ytd-rich-grid-renderer').getAttribute('style').includes('--ytd-rich-grid-items-per-row: 6') && document.querySelectorAll('ytd-rich-item-renderer').length >= 40) {
                startedHomepage = true;
                fixHomepage();
            };
            // upadate styling on all videos when more are loaded
            if (document.querySelectorAll('ytd-rich-item-renderer').length != gridCount) {
                gridCount = document.querySelectorAll('ytd-rich-item-renderer').length;
                startedHomepage = true;
                fixHomepage();
            };
        });
    observer.observe(document.querySelector('ytd-rich-grid-renderer'), {attributes: true, subtree: true});
    };
};


function initWatch() {
    if (window.location.href.includes('/watch')) {
        // on video lazy-load
        var observer = new MutationObserver(function(mutations, observer) {
            if (document.getElementsByClassName('html5-main-video')[0] !== undefined && document.querySelector('.ytp-endscreen-content') != undefined) {

                // on new video
                if (document.getElementsByClassName('html5-main-video')[0] !== lastVidSrc) {
                    GM_log('here')
                    oldVideoChapterWidth = document.querySelector('.ytp-chapters-container').clientWidth;
                    startedForceChapterWidth = false;
                    fixWatch();
                };

                // force update when video dimentions change back to default vlaues
                var vidObserver = new MutationObserver(function(mutations, vidObserver) {
                    if (document.getElementsByClassName('html5-main-video')[0].style.width != `${newVideoWidth}px`) {
                        fixWatch();
                    };
                });
                vidObserver.observe(document.getElementsByClassName('html5-main-video')[0], {attributes: true});

                // re-scale endscreen content (next few functions/observers)
                var endscreenWrapper = document.querySelector('.ytp-endscreen-content');
                function formatEndscreenWrapper() {
                    endscreenWrapper.style.setProperty('top', '0%');
                    endscreenWrapper.style.setProperty('left', '0%');
                    endscreenWrapper.style.setProperty('margin-top', '0px');
                    endscreenWrapper.style.setProperty('margin-left', '0px');
                    endscreenWrapper.style.setProperty('height', '100%');
                    endscreenWrapper.style.setProperty('width', '100%');
                };
                var forceEndscreenWrapperDims = new MutationObserver(function() {
                    if (endscreenWrapper.style.height !== '100%') {
                        formatEndscreenWrapper();
                    };
                    if (document.querySelector('.ytp-endscreen-content').querySelectorAll('a').length > 0) {
                        formatEndscreenWrapper();
                        var endVideoWidth = (newVideoWidth - 5)/4 - 5;
                        var endVideoHeight = (newVideoHeight - 49 - 5)/3 - 5;
                        var vertIndex = 0;
                        var horzIndex = 0;
                        endscreenWrapper.querySelectorAll('a').forEach(function(element) {
                            var top = (endVideoHeight + 5) * vertIndex + 5;
                            var left = (endVideoWidth + 5) * horzIndex + 5;
                            element.style.setProperty('height', `${endVideoHeight}px`);
                            element.style.setProperty('width', `${endVideoWidth}px`);
                            element.style.setProperty('top', `${top}px`);
                            element.style.setProperty('left', `${left}px`);
                            vertIndex++;
                            if (vertIndex > 2) {
                                vertIndex = 0;
                                horzIndex++;
                            };
                        });
                    };
                });
                forceEndscreenWrapperDims.observe(endscreenWrapper, {attributes: true, subtree: true});

                // video on-lazy-load disconnector
                observer.disconnect();
            };
        });
        observer.observe(document.querySelector("body"), {childList: true, subtree: true});
    };
};


function fixUrl() {
    var url = window.location.href;
    var urlNeedsUpdate = false;
    // abort time argument
    if (url.indexOf('&t=') > 1) {
        urlNeedsUpdate = true;
        let url_ = url;
        if(url_.substring('&t=', url_.length).includes('&')) {
            url_ = url_.substring('&t=', url_.length).substring('&', url_.length);
        } else {
            url_ = '';
        };
        url = url.substring(0, url.indexOf('&t=')) + url_;
    };

    // abort list argument
    if ((url.indexOf('list') > 1) && (!url.includes('/playlist'))) {
        urlNeedsUpdate = true;
        let url_ = url;
        if(url_.substring('list=', url_.length).includes('&')) {
            url_ = url_.substring('list=', url_.length).substring('&', url_.length);
        } else {
            url_ = '';
        };
        url = url.substring(0, url.indexOf('&list=')) + url_;
    };
    if (!urlUpdated && urlNeedsUpdate) {
        urlUpdated = true;
        window.location.href = url;
    };
};


// set events to call functions
window.addEventListener('load', function() {
    // abort annoying /watch url arguments
    fixUrl();

    lastArgs = window.location.search;
    if (window.location.href == "https://www.youtube.com/") {
        // initHomepage();
    };
    if (window.location.href.includes('/watch')) {
        // initWatch();
    }
    var observer = new MutationObserver(function(mutations) {
        // youtube homepage changes
        if (window.location.href == "https://www.youtube.com/" && !startedHomepage) {
            startedHomepage = true;
            initHomepage();
        };

        // youtube.com/watch changes
        if (window.location.href.includes('/watch')) {
            if (!startedWatch) {
                startedWatch = true;
                initWatch();
                lastVidSrc = document.getElementsByClassName('html5-main-video')[0].src;
            };
            if (window.location.search != lastArgs) {
                lastArgs = window.location.search;
                initWatch(); // maybe just fixWatch() direct?
                lastVidSrc = document.getElementsByClassName('html5-main-video')[0].src;
            };
        };

    });
    observer.observe(document.querySelector("body"), {childList: true, subtree: true});
});


// @@@@@@@@@ OFFICIAL RESTING PLACE OF YouTube's disable_polymer=1 FEATURE --- MAY IT REST IN PEACE @@@@@@@@@
// enable polymer disable (from: https://greasyfork.org/en/scripts/39544-youtube-polymer-disable)
// if (url.indexOf("disable_polymer") === -1) {
//    if (url.indexOf("?") > 0) {
//      url += "&";
//    } else {
//      url += "?";
//    };
//    url += "disable_polymer=1";
//
//    window.location.href = url;
// };
