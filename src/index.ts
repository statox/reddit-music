import * as async from 'async';
import {getHotYoutubeLinks, SelectedSubmissions} from './reddit';
import {initClient, addItemsToPlaylist, ItemToAdd, extractIdsFromURLs} from './youtube';

const playlistId = 'PLlp3zoFuZjAMuAN1o8kBC6M9x4FvHLtyw'; // reggae
// const playlistId = 'PLlp3zoFuZjAP5QYlyy66xxtUxpkz7KrLm'; // test

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
                const itemsIDs = extractIdsFromURLs(result.links.map((p) => p.url));
                addItemsToPlaylist({itemsIDs, playlistId}, cb);
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
