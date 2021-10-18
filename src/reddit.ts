var snoowrap = require('snoowrap');
const credentials = require('./config/credentials.json');

const snoowrapAuth = credentials.reddit;
const r = new snoowrap(snoowrapAuth);

const handleSubmissions = (posts) => {
    const youtubeSubmissions = posts.filter((p) => p.url && p.url.match(/https:\/\/youtu.be/));
    return youtubeSubmissions.map((p) => {
        return {title: p.title, url: p.url};
    });
};

export const getHotYoutubeLinks = (cb) => {
    r.getSubreddit('reggae')
        .getHot()
        .then((result) => {
            return cb(null, handleSubmissions(result));
        })
        .catch(cb);
};
