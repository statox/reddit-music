// Following the guide on this page
// https://developers.google.com/youtube/v3/quickstart/nodejs
//
// After configuring OAuth2 on the account this script stores
// the token in ./.credentials

var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube'];
var TOKEN_DIR = './.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-credentials.json';

const credentials = require('./credentials.youtube.json');
let client;

export function initClient(cb) {
    console.log('start initClient');
    authorize(credentials, (newClient) => {
        client = newClient;
        console.log('client ready');
        return cb();
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function (code) {
        rl.close();
        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) throw err;
        console.log('Token stored to ' + TOKEN_PATH);
    });
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
export function getChannel(channelName, cb) {
    if (!client) {
        return cb(new Error('getChannel() was called but client is not initialized'));
    }
    var service = google.youtube('v3');
    service.channels.list(
        {
            auth: client,
            part: 'snippet,contentDetails,statistics',
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

export function getPlaylistItems(playlistId, cb) {
    if (!client) {
        return cb(new Error('getPlaylistItems() was called but client is not initialized'));
    }
    var service = google.youtube('v3');
    service.playlistItems.list(
        {
            auth: client,
            part: 'snippet,contentDetails,id,status',
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

export function addPlaylistItems(params, cb) {
    if (!client) {
        return cb(new Error('addPlaylistItems() was called but client is not initialized'));
    }
    checkItemInPlaylist(params, (error, itemIsInPlaylist) => {
        if (itemIsInPlaylist) {
            return cb();
        }
        var service = google.youtube('v3');
        service.playlistItems.insert(
            {
                auth: client,
                part: 'snippet',
                requestBody: {
                    snippet: {
                        playlistId: params.playlistId,
                        resourceId: {
                            kind: params.kind,
                            videoId: params.videoId
                        }
                    }
                }
            },
            function (error, response) {
                if (error) {
                    return cb(error);
                }
                return cb(null, response);
            }
        );
    });
}

export function checkItemInPlaylist(params, cb) {
    if (!client) {
        return cb(new Error('checkItemInPlaylist() was called but client is not initialized'));
    }
    var service = google.youtube('v3');
    service.playlistItems.list(
        {
            auth: client,
            part: 'snippet',
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