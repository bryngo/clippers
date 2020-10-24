const axios = require('axios').default;
const fluent_ffmpeg = require("fluent-ffmpeg");
const util = require('util');
const exec  = util.promisify(require("child_process").exec);
const fs = require('fs');

const config = require('../config');
const utils = require('./utils');

const CLIPS_BASE_API_URL = 'https://api.twitch.tv/kraken/clips/top';
const CLIPS_LIMIT = 5;
const CLIPS_PERIOD = 'month';
const CLIPS_TRENDING = false;

const TWITCH_CLIPS_BASE_URL = 'https://clips.twitch.tv/'

const FRAMERATE_60 = "60/1";

const merge = {
    mergeVideo: async function (req, res, next) {
        res.send("merged videos for " + req.params.streamer)

        let streamerUsername = req.params.streamer;
        let clipSlugs = await getClipSlugs(streamerUsername)
        console.log(clipSlugs.toString());

        // TODO: Don't use streamer username bc this can change
        await downloadSluggedURLs(clipSlugs, streamerUsername);

        // create the directory if it doesn't exist
        let dir = "./public/mergedClips/" + streamerUsername
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        await exec("ffmpeg -f concat -safe 0 -i " +
            "./public/clips/" + streamerUsername + "/recipe.txt " +
            "-c copy ./public/mergedClips/" + streamerUsername + "/" + streamerUsername + ".mp4");

        console.log("Done merging clips for " + streamerUsername)
        console.log("Output at /mergedClips/" + streamerUsername + ".mp4")
    }
};

const download = {
    downloadVideo: async function (req, res, next) {

        let streamerUsername = req.params.streamer;
        let clipSlugs = await getClipSlugs(streamerUsername)
        console.log(clipSlugs.toString());

        // TODO: Don't use streamer username bc this can change
        downloadSluggedURLs(clipSlugs, streamerUsername);
    }
};

/**
 * Returns an array of clip slugs to download
 */
const getClipSlugs = async function (streamer) {

    const options = {
        method: 'get',
        url: getAPIUrl(streamer),
        headers: {
            'Accept': 'application/vnd.twitchtv.v5+json',
            'Client-ID': config.twitchClientID
        }
    };

    return await axios(options)
        .then(function (response) {

            let clips = response.data.clips;
            let clipSlugs = [];

            // grab all the slugged urls for download later
            clips.forEach((clip) => {
                clipSlugs.push(clip['slug']);
            });

            return clipSlugs;
        })
        .catch(function (error) {
            console.log(error);
        });
}

const downloadSluggedURLs = async function(clipSlugs, streamerUsername) {

    // create the directory if it doesn't exist
    let dir = "./public/clips/" + streamerUsername
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

     await Promise.all(clipSlugs.map(async (clipSlug) => {
        let clipUrl = TWITCH_CLIPS_BASE_URL + clipSlug;

        console.log("Downloading " + clipUrl);
        await exec("youtube-dl -f best " +
            "--output " + dir + "/" +
            clipSlug + ".mp4 " +
            clipUrl);
    })).then(() => {
        // after downloading, write them to the recipe file for merging
        console.log("Finished downloading clips.")

         var file = fs.createWriteStream('./public/clips/' + streamerUsername + "/recipe.txt");
         file.on('error', function(err) {
             console.log("[ERROR] Cannot write recipe" + err);
         });
         clipSlugs.forEach(function(v) {
             file.write('file ./' + v + '.mp4\n');
         });
         file.end();

    });
}

const getAPIUrl = function(streamer) {
    return CLIPS_BASE_API_URL + '?' +
        "channel=" + streamer +
        "&period=" + CLIPS_PERIOD +
        "&trending=" + CLIPS_TRENDING +
        "&limit=" + CLIPS_LIMIT;
}

// return true if the video framerate is 60fps
const is60FPS = async function (clipPath) {
    return fluent_ffmpeg.ffprobe(clipPath, function (err, metadata) {
        let clipFramerate = metadata['streams'][0]['r_frame_rate'];
        return clipFramerate === FRAMERATE_60;
    });
}

module.exports.mergeVideo = merge.mergeVideo;
module.exports.downloadVideo = download.downloadVideo;