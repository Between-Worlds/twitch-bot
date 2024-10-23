import { writeFileSync } from 'fs';
import type { Flags, Payload } from 'youtube-dl-exec';
import youtubeDl from 'youtube-dl-exec';

const youtubeVideoUrl = 'https://www.youtube.com/watch?v=';
const youtubeShortUrl = 'https://youtu.be/';

export async function getInfo(url: string, flags: Flags): Promise<string | Payload> {
  return await youtubeDl(url, { dumpSingleJson: true, ...flags });
}

async function fromInfo(jsonFilePath: string, flags: Flags): Promise<string | Payload> {
  return await youtubeDl('', { loadInfoJson: jsonFilePath, ...flags });
}

export async function downloadYouTubeVideo(url: string, outputPath: string, flags?: Flags): Promise<string | Payload> {
  // By default, assume the user has pasted a youtube video url, extract the video id
  let videoId = url.slice(youtubeVideoUrl.length);

  // If the user has pasted a youtube short url, extract the video id
  if (url.startsWith(youtubeShortUrl)) {
    videoId = url.slice(youtubeShortUrl.length);
  }

  const youtubeInfo = await getInfo(url, { output: outputPath, ...flags });

  writeFileSync(`${videoId}.json`, JSON.stringify(youtubeInfo));

  return await fromInfo(`${videoId}.json`, { output: outputPath, ...flags });
}
