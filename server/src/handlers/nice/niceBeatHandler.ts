import fetch from 'node-fetch';
import Config from '../../config';
import { logger } from '../../logger';

export const niceBeatHandler = async (text: string): Promise<ArrayBuffer | null> => {
  if (Config.tiktok.session_id) {
    try {
      const url = `https://nice.gg/beat?&msg=${encodeURI(text)}`;
      const result = await fetch(url, {
        method: 'GET',
      });

      const buffer = await result.arrayBuffer();
      return buffer;
    } catch (error) {
      logger.error(error);
    }
  }
  return null;
};
