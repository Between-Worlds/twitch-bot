/* eslint-disable max-len */
// https://api.twitch.tv/helix/channels/followers

import fetch from 'node-fetch';
import { z } from 'zod';
import { getCurrentAccessToken } from '../../../auth/twitch';
import Config from '../../../config';
import { TWITCH_HELIX_URL } from '../../../constants';
import { logger } from '../../../logger';
import { assertArray } from '../../../utils/assertArray';
import { hasOwnProperty } from '../../../utils/hasOwnProperty';

const UserColorSchema = z.object({
  user_id: z.string(), // An ID that uniquely identifies the user.
  user_login: z.string(), // The user’s login name.
  user_name: z.string(), // The user’s display name.
  color: z.string(), // The Hex color code that the user uses in chat for their name. If the user hasn’t specified a color in their settings, the string is empty.
});

type UserColor = z.infer<typeof UserColorSchema>;

const UserColorsSchema = z.object({
  data: z.array(UserColorSchema),
});

export const fetchUserChatColor = async (userId: string): Promise<UserColor | null> => {
  try {
    const url = `${TWITCH_HELIX_URL}chat/color?user_id=${userId}`;
    const accessToken = getCurrentAccessToken();

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Client-Id': Config.twitch.client_id,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result: unknown = await response.json();

    if (hasOwnProperty(result, 'data')) {
      assertArray(result.data);
      const parseResult = UserColorsSchema.safeParse(result);
      if (parseResult.success) {
        return parseResult.data.data[0];
      } else {
        logger.error(parseResult.error);
      }
    }
  } catch (error) {
    logger.error(error);
  }

  return null;
};
