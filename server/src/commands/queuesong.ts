import { parseHTML } from 'linkedom';
import type { connection } from 'websocket';
import { SECOND_MS } from '../constants';
import { addSongToPlaybackQueue } from '../handlers/spotify/addSongToPlaybackQueue';
import { getTrack } from '../handlers/spotify/getTrack';
import { downloadYouTubeVideo } from '../handlers/youtube/youtube';
import type { BotCommand } from '../types';
import { hasBotCommandParams } from './helpers/hasBotCommandParams';
import { sendChatMessage } from './helpers/sendChatMessage';

// Define the start of a spotify url and uri
const spotifyOpenTrackUrl = 'https://open.spotify.com/track/';
const spotifyLinkUrl = 'https://spotify.link/';
const spotifyTrackStart = 'spotify:track:';

const youtubeVideoUrl = 'https://www.youtube.com/watch?v=';
const youtubeShortUrl = 'https://youtu.be/';

function isSpotifyUrl(url: string): boolean {
  return url.startsWith(spotifyTrackStart) || url.startsWith(spotifyOpenTrackUrl) || url.startsWith(spotifyLinkUrl);
}

function isYouTubeUrl(url: string): boolean {
  return url.startsWith(youtubeVideoUrl) || url.startsWith(youtubeShortUrl);
}

async function queueYouTubeSong(connection: connection, trackInput: string) {
  // Get the video from youtube
  await downloadYouTubeVideo(trackInput, './test.mp4');

  // Check if the video is playable in the streamer's country
}

async function queueSpotifySong(connection: connection, trackInput: string) {
  // By default, assume the user has pasted a spotify uri, extract the track id
  let trackId = trackInput.slice(spotifyTrackStart.length);

  // If the user has pasted an open.spotify.com url, extract the track id
  if (trackInput.startsWith(spotifyOpenTrackUrl)) {
    trackId = trackInput.slice(spotifyOpenTrackUrl.length);

    // If the url has a query string, remove it
    if (trackId.includes('?')) {
      trackId = trackId.split('?')[0];
    }
  }

  // If the user has pasted a spotiy.link url, make a request to the spotify.link api to get the track id
  if (trackInput.startsWith(spotifyLinkUrl)) {
    const spotifyLinkUrlResponse = await fetch(trackInput);

    if (spotifyLinkUrlResponse.status !== 200) {
      sendChatMessage(connection, `Something went wrong adding the song to the queue athanoSad. Try again?`);
      return;
    }

    const htmlResponse = await spotifyLinkUrlResponse.text();
    const actionHref = parseHTML(htmlResponse).window.document.querySelector('a.action')?.getAttribute('href');

    if (!actionHref) {
      sendChatMessage(connection, `Something went wrong adding the song to the queue athanoSad. Try again?`);
      return;
    }

    // trackId format will be like track/trackId?_branch_referrer=stuff
    trackId = actionHref.split('/')[1].split('?')[0];
  }

  // Get the track from spotify
  const track = await getTrack(trackId);

  // Check if the song is playable in the streamer's country
  if (track && !track.is_playable) {
    sendChatMessage(connection, `Song "${track.name}" is not available for me athanoSad`);
    return;
  }

  // Add the track to the playback queue
  const songAddedToQueue = await addSongToPlaybackQueue(`${spotifyTrackStart}${trackId}`);

  // If the track is not added to the queue, send a message to the chat and exit
  if (!songAddedToQueue) {
    sendChatMessage(connection, `Something went wrong adding the song to the queue athanoSad. Try again?`);
    return;
  }

  // If the track is not found, send a message to the chat and exit
  if (!track) {
    sendChatMessage(connection, `Song added to queue athanoCool`);
    return;
  }

  // If the track is found, send a message to the chat and exit
  const trackArtists = track.artists.map((artist) => artist.name).join(', ');
  sendChatMessage(connection, `Song "${track.name} - ${trackArtists}" added to the queue athanoCool`);
}

export const queuesong: BotCommand = {
  command: ['queuesong', 'qs', 'sr', 'songrequest'],
  id: 'queuesong',
  cooldown: 10 * SECOND_MS,
  privileged: false,
  description: 'Add a song to the playback queue (on Spotify)',
  callback: async (connection, parsedCommand) => {
    if (hasBotCommandParams(parsedCommand.parsedMessage)) {
      // Get the track input from the command params (the bit after the command)
      const trackInput = parsedCommand.parsedMessage.command.botCommandParams;

      if (isSpotifyUrl(trackInput)) {
        await queueSpotifySong(connection, trackInput);
        return;
      }

      if (isYouTubeUrl(trackInput)) {
        await queueYouTubeSong(connection, trackInput);
        return;
      }

      sendChatMessage(
        connection,
        `That doesn't look right... athanoThink it needs to be like, for Spotify: ${spotifyTrackStart}stuff, or ${spotifyOpenTrackUrl}stuff, or ${spotifyLinkUrl}stuff. For YouTube: ${youtubeVideoUrl}stuff or ${youtubeShortUrl}stuff`,
      );
    }
  },
};
