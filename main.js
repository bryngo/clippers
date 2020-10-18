var fluent_ffmpeg = require("fluent-ffmpeg");

var mergedVideo = fluent_ffmpeg();

mergedVideo
    .mergeAdd('./clips/1.mp4')
    .mergeAdd('./clips/2.mp4')
    .mergeAdd('./clips/3.mp4')
    // .inputOptions(['-loglevel error','-hwaccel vdpau'])
    // .outputOptions('-c:v h264_nvenc')
    .on('error', function(err) {
        console.log('Error ' + err.message);
    })
    .on('end', function() {
        console.log('Finished!');
    })
    .mergeToFile('./merged.mp4', '/tmp');