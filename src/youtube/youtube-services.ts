import * as async from 'async';
import {google} from 'googleapis';
import {BodyResponseCallback, youtube_v3} from 'googleapis/build/src/apis/youtube';
import {client} from './youtube-auth';
import {ItemsInsertionResults, ItemToAdd} from './youtube-types';

/**
 * Lists the names and IDs of up to 10 files.
 */
export function getChannel(channelName: string, cb: Callback<youtube_v3.Schema$Channel[]>): void {
    if (!client) {
        return cb(new Error('getChannel() was called but client is not initialized'));
    }
    var service = google.youtube('v3');
    service.channels.list(
        {
            auth: client,
            part: ['snippet', 'contentDetails', 'statistics'],
            forUsername: channelName
        },
        function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return cb(err);
            }
            var channels = response.data.items;
            if (channels.length == 0) {
                console.log('No channel found.');
            } else {
                console.log(
                    "This channel's ID is %s. Its title is '%s', and " + 'it has %s views.',
                    channels[0].id,
                    channels[0].snippet.title,
                    channels[0].statistics.viewCount
                );
            }
            return cb(null, channels);
        }
    );
}

export function getPlaylistItems(playlistId: string, cb: Callback<youtube_v3.Schema$PlaylistItemListResponse>): void {
    if (!client) {
        return cb(new Error('getPlaylistItems() was called but client is not initialized'));
    }
    var service = google.youtube('v3');
    service.playlistItems.list(
        {
            auth: client,
            part: ['snippet', 'contentDetails', 'id', 'status'],
            playlistId
        },
        function (error, response) {
            if (error) {
                return cb(error);
            }
            return cb(null, response.data);
        }
    );
}

export function addPlaylistItem(params: ItemToAdd, cb: Callback<youtube_v3.Schema$PlaylistItem>): void {
    if (!client) {
        return cb(new Error('addPlaylistItems() was called but client is not initialized'));
    }
    checkItemInPlaylist(params, (error, itemIsInPlaylist) => {
        if (itemIsInPlaylist) {
            return cb(null);
        }
        var service = google.youtube('v3');
        service.playlistItems.insert(
            {
                auth: client,
                part: ['snippet'],
                requestBody: {
                    snippet: {
                        playlistId: params.playlistId,
                        resourceId: {
                            kind: 'youtube#video',
                            videoId: params.videoId
                        }
                    }
                }
            },
            function (error, response) {
                if (error) {
                    return cb(error);
                }
                return cb(null, response.data);
            }
        );
    });
}

function checkItemInPlaylist(params: ItemToAdd, cb: Callback<boolean>): void {
    if (!client) {
        return cb(new Error('checkItemInPlaylist() was called but client is not initialized'));
    }
    var service = google.youtube('v3');
    service.playlistItems.list(
        {
            auth: client,
            part: ['snippet'],
            playlistId: params.playlistId,
            videoId: params.videoId
        },
        function (error, response) {
            if (error) {
                return cb(error);
            }
            return cb(null, response.data.items.length > 0);
        }
    );
}

export function addItemsToPlaylist(items: ItemToAdd[], cb: Callback<ItemsInsertionResults>) {
    if (!client) {
        return cb(new Error('addItemsToPlaylist() was called but client is not initialized'));
    }

    interface AsyncResult {
        getItemsBefore: youtube_v3.Schema$PlaylistItemListResponse;
        addItems: any;
        getItemsAfter: youtube_v3.Schema$PlaylistItemListResponse;
    }

    async.auto<AsyncResult>(
        {
            getItemsBefore: (cb) => {
                console.log('Get playlist status before insertion');
                getPlaylistItems(items[0].playlistId, cb);
            },
            addItems: [
                'getItemsBefore',
                (result, cb) => {
                    console.log('Insert items to playlist');
                    async.mapSeries(
                        items,
                        (item, cb) => {
                            addPlaylistItem(item, cb);
                        },
                        cb
                    );
                }
            ],
            getItemsAfter: [
                'addItems',
                (_result, cb) => {
                    console.log('Get playlist status after insertion');
                    getPlaylistItems(items[0].playlistId, cb);
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
