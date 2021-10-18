import * as async from 'async';
import {getHotYoutubeLinks, SelectedSubmissions} from './reddit';
import {getChannel, initClient, getPlaylistItems, addPlaylistItem, checkItemInPlaylist} from './youtube.js';

const playlistId = 'PLlp3zoFuZjAMuAN1o8kBC6M9x4FvHLtyw'; // reggae
// const playlistId = 'PLlp3zoFuZjAOkEySCnU6UHxSKpZSdhLC_'; // test

interface AsyncResult {
    initYoutube: void;
    getItemsBefore: any;
    links: SelectedSubmissions[];
    addItems: any;
    getItems: any;
}

async.auto<AsyncResult>(
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
                        addPlaylistItem(
                            {
                                playlistId,
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
