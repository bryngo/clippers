const axios = require('axios').default;
const fluent_ffmpeg = require("fluent-ffmpeg");
const util = require('util');
const exec  = util.promisify(require("child_process").exec);

const config = require('../config');

const CLIPS_BASE_API_URL = 'https://api.twitch.tv/kraken/clips/top';
const CLIPS_LIMIT = 5;
const CLIPS_PERIOD = 'month';
const CLIPS_TRENDING = false;

const CLIPS_BASE_URL = 'https://clips.twitch.tv/'

const merge = {
    mergeVideo: async function (req, res, next) {
        res.send("merged videos for " + req.params.streamer)

        let streamerUsername = req.params.streamer;
        let clipSlugs = await getClipSlugs(streamerUsername)
        console.log(clipSlugs.toString());

        // TODO: Don't use streamer username bc this can cahnge
        await downloadSluggedURLs(clipSlugs, streamerUsername);

        let mergedVideo = fluent_ffmpeg();

        clipSlugs.forEach((clipSlug) => {
            let clipPath = "./public/clips/" + streamerUsername + "/" + clipSlug + ".mp4";

           mergedVideo.addInput(clipPath).
               on('error', function (err) {
                   console.log('Error ' + err.message);
               })
               .on('end', function () {
                   console.log('Finished!');
               })
        });

        let mergedClipPath = "./public/mergedClips/" + streamerUsername + "/" + streamerUsername + ".mp4";
        mergedVideo.mergeToFile(mergedClipPath, './public/tmp')
            .on('error', function(err) {
                console.log('Error ' + err.message);
            })
            .on('end', function() {
                console.log('Finished!');
            });
    }
};

const download = {
    downloadVideo: async function (req, res, next) {

        let streamerUsername = req.params.streamer;
        let clipSlugs = await getClipSlugs(streamerUsername)
        console.log(clipSlugs.toString());

        // TODO: Don't use streamer username bc this can cahnge
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

    // download all the clips in parallel
    // await Promise.all(clipSlugs.map(async(clipSlug) => {
    clipSlugs.forEach((clipSlug) => {
        let clipUrl = CLIPS_BASE_URL + clipSlug;

        console.log("Downloading " + clipUrl);
         exec("youtube-dl -f best " +
            "--output ./public/clips/" + streamerUsername + "/" +
            clipSlug + ".mp4 " +
            clipUrl, (error, stdout, stderr) => {
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
    });
}

const getAPIUrl = function(streamer) {

    return CLIPS_BASE_API_URL + '?' +
        "channel=" + streamer +
        "&period=" + CLIPS_PERIOD +
        "&trending=" + CLIPS_TRENDING +
        "&limit=" + CLIPS_LIMIT;
}

module.exports.mergeVideo = merge.mergeVideo;
module.exports.downloadVideo = download.downloadVideo;