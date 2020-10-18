var request = require('request');
var fluent_ffmpeg = require("fluent-ffmpeg");
const { exec } = require("child_process");


var merge = {
    mergeVideo: function(req, res, next) {
        res.send("merged videos for " + req.params.streamer)

        var mergedVideo = fluent_ffmpeg();

        mergedVideo
            .mergeAdd('./public/clips/1.mp4')
            .mergeAdd('./public/clips/2.mp4')
            .mergeAdd('./public/clips/3.mp4')
            .on('error', function(err) {
                console.log('Error ' + err.message);
            })
            .on('end', function() {
                console.log('Finished!');
            })
            .mergeToFile('./public/mergedClips/' + req.params.streamer + '.mp4', './public/mergedClips');

    }
};

var download = {
    downloadVideo: function(req, res, next) {
        exec("youtube-dl -f best --output \"out.mp4\" https://clips.twitch.tv/PeppyMuddyTeaDeIlluminati", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });

        res.send("Donwloaded")
    }
};

module.exports = merge;
module.exports = download;