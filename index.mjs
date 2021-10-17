import * as async from 'async';
import {getHotYoutubeLinks} from './reddit.js';
import {getChannel, initClient, getPlaylistItems, addPlaylistItems} from './youtube.js';

const playlistId = 'PLlp3zoFuZjAMsFzOTwlEZyptJdvLkT12v'; // reggae
// const playlistId = 'PLlp3zoFuZjANSoZwrRzV7Wrw59EhZx_Ho'; // test
async.auto(
    {
        initYoutube: (cb) => initClient(cb),
        getItemsBefore: [
            'initYoutube',
            (_result, cb) => {
                console.log('getItems');
                getPlaylistItems(playlistId, cb);
            }
        ],
        links: (cb) => {
            console.log('Getting links');
            getHotYoutubeLinks(cb);
        },
        addItems: [
            'initYoutube',
            'getItemsBefore',
            'links',
            (result, cb) => {
                console.log('addItems');
                async.mapSeries(
                    result.links,
                    (post, cb) => {
                        const {url} = post;
                        const parts = url.split('/');
                        const id = parts[parts.length - 1].replace(/\?.*/, '');
                        addPlaylistItems(
                            {
                                playlistId,
                                kind: 'youtube#video',
                                videoId: id
                            },
                            cb
                        );
                    },
                    cb
                );
            }
        ],
        getItems: [
            'initYoutube',
            'addItems',
            (_result, cb) => {
                console.log('getItems');
                getPlaylistItems(playlistId, cb);
            }
        ]
    },
    (error, result) => {
        console.log('In final callback');
        if (error) {
            console.log(error);
            process.exit();
        }
        console.log(result);
        process.exit();
    }
);
