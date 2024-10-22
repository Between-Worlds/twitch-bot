// https://api.twitch.tv/helix/moderation/channels

import fetch from 'node-fetch';
import { getCurrentAccessToken } from '../../../auth/twitch';
import Config from '../../../config';
import { TWITCH_HELIX_URL } from '../../../constants';
import { logger } from '../../../logger';
import { assertArray } from '../../../utils/assertArray';
import { hasOwnProperty } from '../../../utils/hasOwnProperty';

type ModeratedChannels = {
  // The list of channels that the user has moderator privileges in.
  data: {
    broadcaster_id: string; // An ID that uniquely identifies the channel this user can moderate.
    broadcaster_login: string; // The channel's login name.
    broadcaster_name: string; // The channel's display name.
  }[];
  // Contains the information used to page through the list of results. The object is empty if there are no more pages left to page through.
  pagination: {
    cursor: string; // The cursor used to get the next page of results. Use the cursor to set the request’s after query parameter.
  };
};

export const fetchModeratedChannels = async (): Promise<ModeratedChannels['data'] | null> => {
  try {
    const url = `${TWITCH_HELIX_URL}moderation/channels?user_id=${Config.twitch.broadcaster_id}`;
    const accessToken = getCurrentAccessToken();

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Client-Id': Config.twitch.client_id,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result: unknown = await response.json();

    console.log(result);

    if (hasOwnProperty(result, 'data')) {
      assertArray(result.data);
      if (
        result.data.length > 0 &&
        hasOwnProperty(result.data[0], 'broadcaster_id') &&
        hasOwnProperty(result.data[0], 'broadcaster_login') &&
        hasOwnProperty(result.data[0], 'broadcaster_name')
      ) {
        return result.data as ModeratedChannels['data'];
      }
    }
  } catch (error) {
    logger.error(error);
  }

  return null;
};
