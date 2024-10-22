import { writeFileSync } from 'fs';
import { niceBeatHandler } from '../handlers/nice/niceBeatHandler';
import { playSound } from '../playSound';
import type { BotCommand } from '../types';

export async function playBeat(message: string) {
  const buffer = await niceBeatHandler(message);

  if (!buffer) {
    return;
  }

  // For some reason (probably an API error), the buffer was empty,
  // so we don't need to write it to a file
  if (buffer.byteLength === 0) {
    return;
  }

  // Generate a random id for the file name
  const id = Math.random().toString(36).substring(2, 15);
  // Write the buffer to a file
  writeFileSync(`../tts/${id}.mp3`, new Uint8Array(buffer));
  // Play the file
  await playSound(`../tts/${id}.mp3`);
}

export const beat: BotCommand = {
  command: 'beat',
  id: 'beat',
  description: 'https://tkap1.github.io/beat_ui/ there is no real way to use without it',
  callback: async (_, parsedCommand) => {
    const params = parsedCommand.parsedMessage.command?.botCommandParams;
    if (params) {
      await playBeat(params);
    }
  },
};
