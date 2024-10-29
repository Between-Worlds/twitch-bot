import { sendRequest } from '../handlers/obs/obsWebsocket';
import { logger } from '../logger';
import type { BotCommand } from '../types';

export const flipdropgame: BotCommand = {
  command: ['flipdropgame'],
  id: 'flipdropgame',
  privileged: true,
  hidden: true,
  description: '',
  callback: async () => {
    try {
      const isDropgameEnabled = (await sendRequest({
        requestType: 'GetSceneItemEnabled',
        requestId: 'get-flipdropgame-enabled',
        requestData: {
          sceneName: 'Nested Scene-Drop games',
          sceneItemId: 1,
        },
      })) as {
        sceneItemEnabled: boolean;
      };

      if (isDropgameEnabled.sceneItemEnabled) {
        await sendRequest({
          requestType: 'SetSceneItemEnabled',
          requestId: 'set-flipped-dropgame-enabled',
          requestData: {
            sceneName: 'Nested Scene-Drop games',
            sceneItemId: 3,
            sceneItemEnabled: true,
          },
        });
        logger.info('Flipped Dropgame enabled');
        await sendRequest({
          requestType: 'SetSceneItemEnabled',
          requestId: 'set-dropgame-enabled',
          requestData: {
            sceneName: 'Nested Scene-Drop games',
            sceneItemId: 1,
            sceneItemEnabled: false,
          },
        });
        logger.info('Dropgame disabled');
      } else {
        await sendRequest({
          requestType: 'SetSceneItemEnabled',
          requestId: 'set-dropgame-enabled',
          requestData: {
            sceneName: 'Nested Scene-Drop games',
            sceneItemId: 1,
            sceneItemEnabled: true,
          },
        });
        logger.info('Dropgame enabled');
        await sendRequest({
          requestType: 'SetSceneItemEnabled',
          requestId: 'set-flipped-dropgame-enabled',
          requestData: {
            sceneName: 'Nested Scene-Drop games',
            sceneItemId: 3,
            sceneItemEnabled: false,
          },
        });
        logger.info('Flipped Dropgame disabled');
      }
    } catch (error) {
      logger.error(error);
    }
  },
};
