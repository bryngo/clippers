'use strict';

var properties = require('../package.json')
var merge = require('../service/merge');

var controllers = {
    about: function(req, res) {
        var aboutInfo = {
            name: properties.name,
            version: properties.version
        }
        res.json(aboutInfo);
    },
    status: function(req, res) {
        res.json("OK");
    },
    merge: function(req, res) {
        merge.mergeVideo(req, res, function(err, dist) {
            if (err)
                res.send(err);
            res.json(dist);
        });
    },
    download: function(req, res) {
        merge.downloadVideo(req, res, function(err, dist) {
            if (err)
                res.send(err);
            res.json(dist);
        });
    }

};

module.exports = controllers;