'use strict';

const controller = require('./controller');

module.exports = function(app) {
    app.route('/about')
        .get(controller.about);
    app.route('/status')
        .get(controller.status);

    /**
     * :streamer => twitch username of the streamer
     *
     * Download + merge the top clips of the streamer in public/mergedClips
     */
    app.route('/merge/streamer/:streamer')
        .get(controller.merge);

    /**
     * :streamer => twitch username of the streamer
     *
     * Download the top clips of the streamer in public/clips/
     */
    app.route('/download/streamer/:streamer')
        .get(controller.download);
};