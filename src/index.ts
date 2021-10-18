import * as async from 'async';
import {getHotYoutubeLinks, SelectedSubmissions} from './reddit';
import {initClient, addItemsToPlaylist, ItemToAdd} from './youtube';

const playlistId = 'PLlp3zoFuZjAMuAN1o8kBC6M9x4FvHLtyw'; // reggae
// const playlistId = 'PLlp3zoFuZjAMELGeP4Nwa_-RQW8qAS2dB'; // test

interface AsyncResult {
    initYoutube: void;
    links: SelectedSubmissions[];
    addItems: any;
}

async.auto<AsyncResult>(
    {
        initYoutube: (cb) => initClient(cb),
        links: (cb) => {
            console.log('Getting links from reddit');
            getHotYoutubeLinks(cb);
        },
        addItems: [
            'initYoutube',
            'links',
            (result, cb) => {
                console.log('Adding items to youtube playlist');
                const items: ItemToAdd[] = result.links.map((post) => {
                    const {url} = post;
                    const parts = url.split('/');
                    const id = parts[parts.length - 1].replace(/\?.*/, '');
                    return {
                        playlistId,
                        videoId: id
                    };
                });
                addItemsToPlaylist(items, cb);
            }
        ]
    },
    (error, result) => {
        if (error) {
            console.log(error);
            process.exit(1);
        }
        console.log('Number of videos inserted in the playlist', result.addItems.nbInsertedItems);
        process.exit(0);
    }
);
