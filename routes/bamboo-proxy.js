var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
require('dotenv').load();
var url = require('url');

var querystring = require('querystring');

var eventTypesRaw = process.env.BAMBOO_EVENT_NOTIFIER_TYPES;

var eventTypes = [];

if (eventTypesRaw != null) {
    eventTypes = eventTypesRaw.split(',');
} else {
    console.warn("github-repo-event-notifier is not setup to receive any events (BAMBOO_EVENT_NOTIFIER_TYPES is empty).");
}

var express = require('express');
var fetch = require('node-fetch');
var router = express.Router();

router.get("/", function(req, res) {
    return res.end("GitHub Bamboo Proxy");
});

console.info("registered GET /bamboo");

router.post("/", function(req, res) {
    var auth, auto_trigger, bamboo_uri, bamboo_url, build_key, data, error, error1, eventType, pass, query, room, user;
    user = process.env.BAMBOO_USERNAME;
    pass = process.env.BAMBOO_PASSWORD;
    auth = new Buffer(user + ':' + pass).toString('base64');
    query = querystring.parse(url.parse(req.url).query);
    bamboo_url = query.bamboo;
    build_key = query.buildKey;
    room = query.room;
    auto_trigger = query.auto;
    if (!bamboo_url) {
        return res.end("");
    }

    data = req.body;
    eventType = req.headers["x-github-event"];
    console.log("Processing event type " + eventType + "...");
    try {
        if (indexOf.call(eventTypes, eventType) >= 0) {
            if (auto_trigger) {
                bamboo_uri = bamboo_url + "/rest/api/latest/queue/" + build_key + "?bamboo.variable.pull_ref=" + data.pull_request.head.ref + "&bamboo.variable.pull_sha=" + data.pull_request.head.sha + "&bamboo.variable.pull_num=" + data.number;

                var headers = { Authorization: "Basic " + auth};
                console.log("Invoking " + bamboo_uri);
                fetch(bamboo_uri, { method: 'POST', headers: headers })
                    .catch(function(rejection) {
                        return console.log("Encountered an error sending to bamboo " + rejection);
                    })
                    .then(function(res) {
                        return res.text();
                    }).then(function(body) {
                    console.log(body);
                });
            }
        } else {
            console.log("Ignoring " + eventType + " event as it's not allowed.");
        }
    } catch (error1) {
        error = error1;
        console.log("github repo event notifier error: " + error + ". Request: " + req.body);
        console.log(error.stack);
    }
    console.log("Finished processing event type " + eventType);
    return res.end("");
});

module.exports = router
