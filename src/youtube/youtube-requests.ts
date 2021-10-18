import {google} from 'googleapis';
import {BodyResponseCallback, youtube_v3} from 'googleapis/build/src/apis/youtube';
import {ItemToAdd} from './youtube-types';
import {client} from './youtube-auth';

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
