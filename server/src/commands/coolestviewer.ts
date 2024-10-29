import { getOBSWebSocketConnection, sendRequest } from '../handlers/obs/obsWebsocket';
import { fetchUserChatColor } from '../handlers/twitch/helix/fetchUserChatColor';
import { logger } from '../logger';
import type { BotCommand } from '../types';
import { hexToABGRNumeric } from '../utils/hexToABGRNumeric';
import { hasBotCommandParams } from './helpers/hasBotCommandParams';
import { sendChatMessage } from './helpers/sendChatMessage';

export const coolestviewer: BotCommand = {
  command: ['coolestviewer'],
  id: 'coolestviewer',
  privileged: true,
  hidden: true,
  description: '',
  callback: async (connection, parsedCommand) => {
    if (hasBotCommandParams(parsedCommand.parsedMessage)) {
      const obsWebSocket = getOBSWebSocketConnection();

      if (!obsWebSocket) {
        return;
      }

      const splitParams = parsedCommand.parsedMessage.command.botCommandParams.split(',');
      const userId = splitParams[0];
      if (!userId) {
        logger.error('coolestviewer: userId is missing');
        return;
      }

      const username = splitParams[1];
      if (!username) {
        logger.error(`coolestviewer: username is missing for user with ID ${userId}`);
        return;
      }

      let colorToUse = '#FFFFFF';
      const userChatColor = await fetchUserChatColor(userId);
      if (userChatColor === null) {
        return;
      } else if (userChatColor.color === '') {
        logger.debug(`coolestviewer: userChatColor.color for user ${username} is empty`);
      } else {
        colorToUse = userChatColor.color;
        logger.debug(`coolestviewer: userChatColor.color for user ${username} is ${colorToUse}`);
      }

      await sendRequest({
        requestType: 'GetInputSettings',
        requestId: 'get-input-settings',
        requestData: {
          inputName: 'Coolest Viewer',
        },
      });

      await sendRequest({
        requestType: 'SetInputSettings',
        requestId: 'set-coolest-viewer-name',
        requestData: {
          inputName: 'Coolest Viewer',
          inputSettings: {
            color: hexToABGRNumeric(colorToUse),
            text: `Coolest Viewer: ${username}`,
          },
        },
      });

      await sendRequest({
        requestType: 'SetSceneItemEnabled',
        requestId: 'set-coolest-viewer-enabled',
        requestData: {
          sceneName: 'Live Scene',
          sceneItemId: 31,
          sceneItemEnabled: true,
        },
      });

      sendChatMessage(connection, `${username} is today's coolest viewer`);
    }
  },
};
