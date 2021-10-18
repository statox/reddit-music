# Reddit music

This is a tool which gets the youtube links in a specific subreddit and adds them to a defined playlist. I love reggae music and the people on [r/reggae](https://reddit.com/r/reggae) often share very good tracks on youtube but the Reddit interface is not convenient to play everything in the background, so this app fixes that.

## Work in progress

The app is a work in progress, here are the next steps

- [ ] Clean up the code after the POC
 - [ ] Create proper modules keeping what is currently exposed
 - [ ] Use typescript
 - [ ] Rework the module to expose better API
- [ ] Deployment
 - [ ] Define where to run the app (Github action, self hosted, parcel, something else?)
 - [ ] Rework the secret management to be deployable from a CI
- [ ] Improve configuration
 - [ ] Add a system to configure one or several subreddits by playlist
 - [ ] Create a UI to handle that
- [ ] Add the ability to create playlists from the configuration
- [ ] Add the ability to handle more than 5000 videos (seems to be the current limit of videos in a playlist)
- [ ] Handle Spotify playlists
