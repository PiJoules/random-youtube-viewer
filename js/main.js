
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
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        //height: '390',
        //width: '640',
        height: height + '',
        width: width + '',
        playerVars: { 'rel': 0, color: 'white', theme: 'light'},
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
};

function onPlayerReady(event) {
    loadVideo();
};

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        // video ended, time to load the next video
        loadVideo();
    }
};

function onPlayerError() {
    // just give up and try to load a new video :-(
    loadVideo();
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
        player.loadVideoById(video.id);
    });
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


$(document).ready(function(){

    // these two buttons do the same thing :-p
    $("#play_button").click(loadVideo);
    $("#skip_button").click(loadVideo);

    $("#video_keywords").keypress(function(e) {
        if(e.which == 10 || e.which == 13) {
            loadVideo();
        }
    });
});





