"use strict";
var snoowrap = require("snoowrap");
const credentials = require("./credentials.json");

const snoowrapAuth = credentials.reddit;
const r = new snoowrap(snoowrapAuth);

const handleSubmissions = (posts) => {
  const youtubeSubmissions = posts.filter(
    (p) => p.url && p.url.match(/https:\/\/youtu.be/)
  );
  console.log(
    youtubeSubmissions.map((p) => {
      return { title: p.title, url: p.url };
    })
  );
};

r.getSubreddit("reggae").getHot().then(handleSubmissions);
