
// Print errors
window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
    alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber
    + ' Column: ' + column + ' StackTrace: ' +  errorObj);
};

// Smooth scrolling
$(function() {
    $('a[href*=#]:not([href=#])').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top
                }, 1000);
                return false;
            }
        }
    });
});


// <!-- Youtube player functions
function randRange(min,max) {
    return Math.floor(Math.random()*(max-min + 1)) + min;
};

// initialize player
// video scale of 640/390 (w:h)
// videoId: 'SmobkT8IuxM',
function onYouTubeIframeAPIReady() {
    if (!onMobile){
        player = new YT.Player('player', {
            height: height + '',
            width: width + '',
            playerVars: { 'rel': 0, color: 'white', theme: 'light'},
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
    }
    // Add videoId to player constructor if on mobile
    else {
        // setup timer to change loading animation
        clearInterval(changeLoadTimer);
        changeLoadTimer = setInterval(changeLoadAnimation, 120);

        var query = $("#video_keywords").val();
        pickRandomVideo(query,function(video) {
            // stop loading animation
            clearInterval(changeLoadTimer);
            $("#currently_playing").html(video.name + "<br>");

            player = new YT.Player('player', {
                videoId: video.id + '',
                height: height + '',
                width: width + '',
                playerVars: { 'rel': 0, color: 'white', theme: 'light'},
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange,
                    'onError': onPlayerError
                }
            });

        });
    }
};

function onPlayerReady(event) {
    if (!onMobile)
        loadVideo();
    // Do not create a new video player if on mobile since
    // this method is called after crating a new video player
    // while on mobile, and would loop over and over
};

// Video ended, time to load the next video
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        if (!onMobile)
            loadVideo();
        else
            reloadYoutubeScript();
    }
};

// Just give up and try to load a new video :-(
function onPlayerError() {
    if (!onMobile)
        loadVideo();
    else
        reloadYoutubeScript();
};

// loads a video list for a query
function getVideoList(query,start_index,max_results,callback) {
    
    // YouTube API search request
    var url = "https://gdata.youtube.com/feeds/api/videos?alt=json" +
            "&q=" + encodeURIComponent(query) +
            "&start-index=" + start_index +
            "&max-results=" + max_results +
            //"&duration=short" +
            "&format=5" +
            "&v=2.1&callback=?";
    
    $.getJSON(url, function(json) {
        var videos = [];
        for (var i = 0; i < json.feed.entry.length; i++) {
            var entry = json.feed.entry[i];
            var name = entry.title.$t;
            var link = entry.link[0].href;
            videos.push({name:name,link:link});
        }
        callback(videos);
    });
};

// extracts a video id from a url
function extractVideoId(url) {
    var video_id = url.split('v=')[1];
    var ampersandPosition = video_id.indexOf('&');
    if(ampersandPosition != -1) {
        video_id = video_id.substring(0, ampersandPosition);
    }
    return video_id;
};

// pick a video based on a query
function pickRandomVideo(query, callback) {
    
    var PAGE_SIZE = 50; // number of results returned on one 'page'
    var NUM_PAGES = 10; // max number of 'pages' available to this API
    
    var pageOffset = randRange(0,PAGE_SIZE-1);

    getVideoList(query,pageOffset*NUM_PAGES+1,NUM_PAGES, function(videos) {
        
        var vidIndex = randRange(0,NUM_PAGES-1);
        var videoId = extractVideoId(videos[vidIndex].link);
        
        videos[vidIndex].id = videoId;
        
        var index = last_picked_videos.indexOf(videoId);
        
        if ($.inArray(videoId, last_picked_videos) != -1) {
            // retry, find a video that hasn't been played in a while
            pickRandomVideo(query, callback);
        }
        else {
            // add this video to the queue of recently picked videos
            last_picked_videos.push(videoId);
            if (last_picked_videos.length > last_picked_videos_max) {
                last_picked_videos.shift();
            }
            callback(videos[vidIndex]);
        }
    });
};

function loadVideo() {
    
    
    // setup timer to change loading animation
    clearInterval(changeLoadTimer);
    changeLoadTimer = setInterval(changeLoadAnimation, 120);

    // get the query and pick a video
    var query = $("#video_keywords").val();
    pickRandomVideo(query,function(video) {

        // stop loading animation
        clearInterval(changeLoadTimer);
        $("#currently_playing").html(video.name + "<br>");
        
        // give YouTube player the new video
        if (!onMobile)
            player.loadVideoById(video.id);

        // Give some time for a video to load one of the first few frames
        // after loading
        /*if (firstVideo){
            //setTimeout(function(){
                player.pauseVideo();
            //}, 500);
            firstVideo = false;
        }*/
    });
};


// Rerun the edited script for implementing youtube's video player
function reloadYoutubeScript(){
    $("#player-container").html(""); // remove the iframe

    // remove the external script
    $("#youtube-api").remove();
    $("#www-widgetapi-script").remove();

    $("#player-container").html('<div id="player"></div>'); // re-add the player
    $("body").append('<script src="/js/youtube-api.js" type="text/javascript"></script>'); // re-add the external script to trigger to reload the player
};


// cycles the loading animation
function changeLoadAnimation() {
    var loadingStates = ["   ",".  ",".. ","..."," ..","  ."];
    $("#currently_playing").html("Finding video" + loadingStates[loadingState]);
    if (loadingState >= loadingStates.length-1)
        loadingState = 0;
    else
        loadingState = loadingState + 1;
};

// Youtube Player functions -->

// Major functions call order (if not on mobile)
// 1. onYouTubeIframeAPIReady()
// 2. loadVideo()
// 3. pickRandomVideo()
// 4. getVideoList()
// 5. extractVideoId()


var firstVideo = true; // pause only on first video/ when page is first loaded
var last_picked_videos = [];
var last_picked_videos_max = 10;
var changeLoadTimer;
var player;
var nextVideo = null;
var loadingState = 0;
var width = 640;
var height = 390;
if (window.innerWidth < width){
    width = window.innerWidth-30; // the -30 if for the padding in the container
    height = width*390/640;
}

// For detecting if on mobile or not
// The loadVideoById() method does not work on mobile (or safari mobile at least)
var md = new MobileDetect(window.navigator.userAgent);
var onMobile = md.mobile();


$(document).ready(function(){

    // these two buttons do the same thing :-p
    $("#play_button").click(function(){
        if (!onMobile)
            loadVideo();
        else
            reloadYoutubeScript();
    });
    $("#skip_button").click(function(){
        if (!onMobile)
            loadVideo();
        else
            reloadYoutubeScript();
    });

    $("#video_keywords").keypress(function(e) {
        if(e.which == 10 || e.which == 13) {
            if (!onMobile)
                loadVideo();
            else
                reloadYoutubeScript();
        }
    });
});





