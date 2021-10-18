import * as async from 'async';
import {youtube_v3} from 'googleapis/build/src/apis/youtube';
import {addPlaylistItem, getPlaylistItems} from './youtube-requests';
import {ItemsInsertionResults} from './youtube-types';

export function extractIdsFromURLs(urls: string[]): string[] {
    return urls.map((url) => {
        const parts = url.split('/');
        return parts[parts.length - 1].replace(/\?.*/, '');
    });
}

export function addItemsToPlaylist(
    params: {itemsIDs: string[]; playlistId: string},
    cb: Callback<ItemsInsertionResults>
) {
    const {itemsIDs, playlistId} = params;

    interface AsyncResult {
        getItemsBefore: youtube_v3.Schema$PlaylistItemListResponse;
        addItems: any;
        getItemsAfter: youtube_v3.Schema$PlaylistItemListResponse;
    }

    async.auto<AsyncResult>(
        {
            getItemsBefore: (cb) => {
                console.log('Get playlist status before insertion');
                getPlaylistItems(playlistId, cb);
            },
            addItems: [
                'getItemsBefore',
                (result, cb) => {
                    console.log('Insert items to playlist');
                    async.mapSeries(
                        itemsIDs,
                        (id, cb) => {
                            addPlaylistItem(
                                {
                                    videoId: id,
                                    playlistId
                                },
                                cb
                            );
                        },
                        cb
                    );
                }
            ],
            getItemsAfter: [
                'addItems',
                (_result, cb) => {
                    console.log('Get playlist status after insertion');
                    getPlaylistItems(playlistId, cb);
                }
            ]
        },
        (error, result) => {
            if (error) {
                return cb(error);
            }
            const itemsBeforeInsertion = result.getItemsBefore.pageInfo.totalResults;
            const itemsAfterInsertion = result.getItemsAfter.pageInfo.totalResults;
            const nbInsertedItems = itemsAfterInsertion - itemsBeforeInsertion;

            return cb(null, {nbInsertedItems});
        }
    );
}
