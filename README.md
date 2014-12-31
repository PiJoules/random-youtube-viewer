# Random YouTube Video Player
A simple webapp that plays youtube videos selected randomly from a query to YouTube. An example is hosted on Google App Engine at http://solar-dialect-810.appspot.com/. This is essentially an improved version of [Ethan Jennings's](https://github.com/ethanhjennings/random-youtube-viewer) YouTube viewer such that the video player can now work on mobile, and the design was redone using Bootstrap.

## Usage
Type any query into the search box just as you would on Youtube's search box. The player chooses a random video based on this query. If no query is present, then the video will probably be something chosen based on your youtube history if you aren't logged in. (But don't hold me up on this. This is just what I've seen from when I use this.)

## Dependencies
- [Bootstrap 3](http://getbootstrap.com/)
- [jQuery](http://jquery.com/)
- [YouTube Player API Reference for iframe Embeds](https://developers.google.com/youtube/iframe_api_reference)
- [mobile-detect.js](http://hgoebl.github.io/mobile-detect.js/)