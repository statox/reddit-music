import Snoowrap, {Listing, Submission} from 'snoowrap';
import {SelectedSubmissions} from './reddit-types';

var snoowrap = require('snoowrap');
const credentials = require('../config/credentials.json');

const snoowrapAuth = credentials.reddit;
const r: Snoowrap = new snoowrap(snoowrapAuth);

const handleSubmissions = (posts: Listing<Submission>): SelectedSubmissions[] => {
    const youtubeSubmissions = posts.filter((p) => p.url && p.url.match(/https:\/\/youtu.be/));
    return youtubeSubmissions.map((p) => {
        return {title: p.title, url: p.url};
    });
};

export const getHotYoutubeLinks = (cb: Callback<SelectedSubmissions[]>) => {
    r.getSubreddit('reggae')
        .getHot()
        .then((result) => {
            return cb(null, handleSubmissions(result));
        })
        .catch(cb);
};
