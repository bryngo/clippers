'use strict';

const controller = require('./controller');

module.exports = function(app) {
    app.route('/about')
        .get(controller.about);
    app.route('/status')
        .get(controller.about);

    /**
     * :streamer => twitch username of the streamer
     */
    app.route('/merge/streamer/:streamer')
        .get(controller.merge);

    app.route('/test')
        .get(controller.download);
};