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
var chapterWidths;
var fullscreenMode = false;
var defaultPlayerWidth;
var defaultPlayerHeight;

// various changes to the YouTube Homepage layout
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

    // remove home, trending, subscriptions, and library buttons on app-bar
    document.querySelector('#header.ytd-guide-collapsible-section-entry-renderer').style.setProperty('display', 'none');
    document.querySelectorAll('#sections.ytd-guide-renderer > *.ytd-guide-renderer:first-child > #items > ytd-guide-entry-renderer').forEach(function(element) {
        element.style.setProperty('display', 'none');
    })

    // move app-bar alignment up
    document.querySelector('#sections.ytd-guide-renderer > *.ytd-guide-renderer:first-child').style.setProperty('padding-top', '0px');
    document.querySelector('ytd-guide-renderer.ytd-app').style.setProperty('margin-top', '-12px');

};


function fixWatch() {
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
    } else { // fullscreen mode
        // rescale main video and progress bar
        document.querySelector('.html5-video-player').style.setProperty('width', '100%');
        document.querySelector('.html5-video-player').style.setProperty('height', '100%');
        document.querySelector('.html5-main-video').style.setProperty('width', `${screen.width}px`);
        document.querySelector('.html5-main-video').style.setProperty('height', `${screen.height}px`);
        document.querySelector('.ytp-chrome-bottom').style.width = `${screen.width - 48}px`;
        document.querySelector('ytp-chapter-hover-container').style.width = `${screen.width - 48}px`;
    };

    // update scrubber chapter widths if present
    if (document.querySelector('.ytp-chapters-container').querySelectorAll('.ytp-chapter-hover-container').length > 1) {
        var index = 0;
        document.querySelector('.ytp-chapters-container').querySelectorAll('.ytp-chapter-hover-container').forEach(function(chapter) {
            var chapterWidth = chapterWidths[index];
            chapter.style.setProperty('width', chapterWidth);
            index++;
        });
        // document.querySelector('.ytp-chapters-container').querySelector('.ytp-chapter-hover-container').style.setProperty('display', 'none'); // display: none to original scrubber bar
    };
    /*
    // correct chapters if video has no chapters
    if (document.querySelector('.ytp-chapters-container').querySelectorAll('.ytp-chapter-hover-container').length == 1) {
        document.querySelector('.ytp-chapters-container').querySelector('.ytp-chapter-hover-container').style.removeProperty('display');
    };
    */
};


function initHomepage () {
    if (window.location.href == 'https://www.youtube.com/') {
        gridCount = document.querySelectorAll('ytd-rich-item-renderer').length;
        fixHomepage();
        var observer = new MutationObserver(function(mutations) {
            // preload LOTS of videos (more usable with 6-vids across)
            if (!document.querySelector('ytd-rich-grid-renderer').getAttribute('style').includes('--ytd-rich-grid-items-per-row: 20') && document.querySelectorAll('ytd-rich-item-renderer').length < 60) {
                document.querySelector('ytd-rich-grid-renderer').setAttribute('style', '--ytd-rich-grid-items-per-row: 20');
                startedHomepage = true;
            };
            if (!document.querySelector('ytd-rich-grid-renderer').getAttribute('style').includes('--ytd-rich-grid-items-per-row: 6') && document.querySelectorAll('ytd-rich-item-renderer').length >= 60) {
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
        var lazyWatchObserver = new MutationObserver(function(mutations, observer) {
            if (document.getElementsByClassName('html5-main-video')[0] !== undefined && document.querySelector('.ytp-endscreen-content') != undefined && document.querySelector('#items.ytd-watch-next-secondary-results-renderer') != undefined) {


                // one-time

                // set default height/width of video
                defaultPlayerWidth = Number(document.getElementsByClassName('html5-main-video')[0].style.getPropertyValue('width').replace('px', ''));
                defaultPlayerHeight = Number(document.getElementsByClassName('html5-main-video')[0].style.getPropertyValue('height').replace('px', ''));

                // force update when video dimentions change back to default vlaues
                var vidObserver = new MutationObserver(function(mutations, vidObserver) {
                    if (document.getElementsByClassName('html5-main-video')[0].style.width != `${newVideoWidth}px` && !fullscreenMode) {
                        fixWatch();
                    };
                });
                vidObserver.observe(document.getElementsByClassName('html5-main-video')[0], {attributes: true});

                // handle fullscreen mode
                var updatedFullscreen = false;
                var fullscreenObserver = new MutationObserver(function(mutations, fullscreenObserver) {
                    if (document.querySelector('#player-theater-container').querySelector('video') != undefined) {
                            if (!updatedFullscreen && document.getElementsByClassName('html5-main-video')[0].style.getPropertyValue('width') != `${screen.width}px`) {
                                updatedFullscreen = true;
                                fullscreenMode = true;
                                fixWatch();
                            };
                    } else {
                        if (updatedFullscreen) {
                            updatedFullscreen = false;
                            fullscreenMode = false;
                            fixWatch();
                        };
                    };
                });
                fullscreenObserver.observe(document.querySelector('.html5-video-player'), {attributes: true});

                // re-scale and enforce endscreen content (next few functions/observers) (!currently broken??!)
                function formatEndscreenWrapper() {
                    var endscreenWrapper = document.querySelector('.ytp-endscreen-content');
                    endscreenWrapper.style.setProperty('top', '0%');
                    endscreenWrapper.style.setProperty('left', '0%');
                    endscreenWrapper.style.setProperty('margin-top', '0px');
                    endscreenWrapper.style.setProperty('margin-left', '0px');
                    endscreenWrapper.style.setProperty('height', '100%');
                    endscreenWrapper.style.setProperty('width', '100%');
                };
                var forceEndscreenWrapperDims = new MutationObserver(function() {
                    if (document.querySelector('.ytp-endscreen-content').style.height !== '100%') {
                        formatEndscreenWrapper();
                    };
                    if (document.querySelector('.ytp-endscreen-content').querySelectorAll('a').length > 0) {
                        formatEndscreenWrapper();
                        var endVideoWidth = (newVideoWidth - 5)/4 - 5;
                        var endVideoHeight = (newVideoHeight - 49 - 5)/3 - 5;
                        var vertIndex = 0;
                        var horzIndex = 0;
                        document.querySelector('.ytp-endscreen-content').querySelectorAll('a').forEach(function(element) {
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

                // get original chapter widths (if chapters get loaded)
                var originalChapterWidths = [];
                var initialSampleTaken = false;
                var perVidChapterObserver = new MutationObserver(function(mutations, perVidChapterObserver) {
                    function getOrig() {
                     var index = 0;
                        document.querySelector('.ytp-chapters-container').querySelectorAll('.ytp-chapter-hover-container').forEach(function(chapter) {
                            originalChapterWidths[index] = Number(chapter.style.getPropertyValue('width').replace('px', '').replace('%',''));
                            index++;
                        });
                    }
                    if (document.querySelector('.ytp-chapters-container').querySelectorAll('.ytp-chapter-hover-container').length > 1) {
                        getOrig();
                        perVidChapterObserver.disconnect();
                    };
                    if (!initialSampleTaken) {
                        initialSampleTaken = true;
                        getOrig();
                    };
                });
                perVidChapterObserver.observe(document.querySelector('.ytp-chapters-container'), {attributes: true, subtree: true});
                var chapterBlocksObserver = new MutationObserver(function() {
                    var hoverContainerWidth = document.querySelector('.ytp-chapter-hover-container').style.getPropertyValue('width');
                    if ((hoverContainerWidth == `${originalChapterWidths[0]}px` || hoverContainerWidth == `${originalChapterWidths[0]}%`) && document.querySelector('.ytp-chapters-container').querySelectorAll('.ytp-chapter-hover-container').length > 1) {
                        GM_log('upadated chapter widths (hopefully not too frequently???');
                        calculateChapterWidths();
                        fixWatch();
                    };
                });
                chapterBlocksObserver.observe(document.querySelector('.ytp-chapter-hover-container'), {attributes: true});

                 // recalculates chapter widths and places them inside [chapterWidths]
                function calculateChapterWidths() {
                    if (document.querySelector('.ytp-chapters-container').querySelectorAll('.ytp-chapter-hover-container').length > 1) {
                        chapterWidths = [];
                        var chapterScaleRatio = (newVideoWidth - 24)/oldVideoChapterWidth;
                        var index = 0;
                        document.querySelector('.ytp-chapters-container').querySelectorAll('.ytp-chapter-hover-container').forEach(function(chapter) {
                            var chapterWidth = Math.floor(originalChapterWidths[index]*chapterScaleRatio);
                            chapterWidths[index] = `${chapterWidth}px`;
                            index++;
                        });
                    };
                };
                oldVideoChapterWidth = document.querySelector('.ytp-chapters-container').clientWidth;

                // make view-count font larger
                document.querySelector('yt-view-count-renderer').style.setProperty('font-size', '1.7rem');

                // auto-expaand live chat replay box
                var chatObserver = new MutationObserver(function() {
                    if (document.querySelector('ytd-live-chat-frame') != undefined && document.querySelector('ytd-live-chat-frame').attributes.hasOwnProperty('collapsed')) {
                        document.querySelector('ytd-toggle-button-renderer > a > paper-button').click();
                    };
                });
                chatObserver.observe(document.querySelector('#secondary-inner'), {attributes: true, subtree: true});

                // on new reccomended videos load
                var lastReccomendedCount = 0;
                var reccomendedLoadObserver = new MutationObserver(function() {
                    if (lastReccomendedCount != document.querySelector('#items.ytd-watch-next-secondary-results-renderer').querySelectorAll('ytd-compact-video-renderer').length) {
                        document.querySelector('#items.ytd-watch-next-secondary-results-renderer').querySelectorAll('ytd-compact-video-renderer').forEach(function(element) {
                            // remove annoying popups on /watch reccomended videos
                            element.querySelector('#hover-overlays').style.setProperty('display', 'none');
                        });
                    };
                });

                // on-new-video
                var newVidObserver = new MutationObserver(function() {
                    if (window.location.search != lastArgs) {
                        lastArgs = window.location.search;

                        // relaunch reccomendedLoadObserver
                        lastReccomendedCount = document.querySelector('#items.ytd-watch-next-secondary-results-renderer').querySelectorAll('ytd-compact-video-renderer').length;
                        reccomendedLoadObserver.disconnect();
                        reccomendedLoadObserver.observe(document.querySelector('#items.ytd-watch-next-secondary-results-renderer'), {attributes: true, subtree: true});

                        // relaunch endscreen controller observer
                        forceEndscreenWrapperDims.disconnect();
                        var endscreenLoad = new MutationObserver(function(mutations, observer) {
                            if (document.querySelector('.ytp-endscreen-content') != undefined) {
                                forceEndscreenWrapperDims.observe(document.querySelector('.ytp-endscreen-content'), {attributes: true, subtree: true});
                                observer.disconnect();
                            };
                        });
                        endscreenLoad.observe(document.querySelector('body'), {attributes: true, subtree: true});

                        // wait for framepreview width to be defined to center framepreview
                        var somethingRatio = newVideoHeight/defaultPlayerHeight;
                        var framepreviewObserver = new MutationObserver(function(mutations, observer) {
                            if (document.querySelector('.ytp-storyboard-framepreview').style.display !== 'none') {
                                document.querySelector('.ytp-storyboard-framepreview').style.setProperty('width', `${window.getComputedStyle(document.querySelector('.ytp-storyboard-framepreview-img')).width.replace('px','') * somethingRatio}px`);
                                observer.disconnect();
                            };
                        });
                        framepreviewObserver.observe(document.querySelector('.ytp-storyboard-framepreview'), {attributes: true});

                        calculateChapterWidths(); // must wait until loaded?
                        startedForceChapterWidth = false; // maybe after next line?
                        fixWatch();
                        lastVidSrc = document.getElementsByClassName('html5-main-video')[0].src;

                    };
                });
                newVidObserver.observe(document.querySelector("body"), {childList: true, subtree: true});



                // on video lazy-load disconnector
                observer.disconnect();
            };
        });
        lazyWatchObserver.observe(document.querySelector("body"), {childList: true, subtree: true});
    };
};


function initUniversal() { // calls every new page
    // masthead on-load
    var mastheadObserver = new MutationObserver(function(mutations, mastheadObserver) {
        if (document.querySelector('ytd-masthead') != undefined) {

            // move search bar to the left side of the screen, widen
            document.querySelector('#end.ytd-masthead').style.setProperty('margin-left', 'auto');
            document.querySelector('#center.ytd-masthead').style.setProperty('max-width', '900px');
            document.querySelector('#guide-button.ytd-masthead').style.setProperty('margin-right', '0px');

            // remove opacity from masthead bar
            document.querySelector('ytd-masthead > #container').style.background = 'white';

            // reset search when moving to new page
            if (!window.location.href.includes('search_query=')) {
                document.querySelector('#search-form.ytd-searchbox').reset();
            };

            mastheadObserver.disconnect();
        };
    });
    mastheadObserver.observe(document.querySelector('body'), {attributes: true, subtree: true});
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

    lastArgs = null;
    var lastUrl;
    var observer = new MutationObserver(function(mutations) {
        // youtube homepage changes
        if (window.location.href == "https://www.youtube.com/" && !startedHomepage) {
            startedHomepage = true;
            initHomepage();
        };

        // youtube.com/watch changes
        if (window.location.href.includes('/watch') && !startedWatch) {
            startedWatch = true;
            initWatch();
            lastVidSrc = document.getElementsByClassName('html5-main-video')[0].src;
        };

        // universial changes
        if (lastUrl != window.location.href) {
            initUniversal();
        };
        lastUrl = window.location.href;

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

