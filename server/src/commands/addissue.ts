import type { BotCommand } from '../types';
import { hasBotCommandParams } from './helpers/hasBotCommandParams';
import { sendChatMessage } from './helpers/sendChatMessage';
import { createIssue } from '../handlers/github/createIssue';

export const addissue: BotCommand = {
  command: 'addissue',
  id: 'addissue',
  priviliged: true,
  hidden: true,
  callback: async (connection, parsedMessage) => {
    if (hasBotCommandParams(parsedMessage)) {
      const newIssue = parsedMessage.command?.botCommandParams;
      if (newIssue) {
        const newIssueParts = newIssue.split('"').filter((x) => x.trim().length > 0);
        if (newIssueParts.length !== 2) {
          return sendChatMessage(connection, `Something went wrong. The command should be used like !addissue "title" "description"`);
        }

        const newIssueTitle = newIssueParts[0];
        const newIssueDescription = newIssueParts[1];
        const createdIssue = await createIssue(newIssueTitle, newIssueDescription);
        if (createdIssue) {
          sendChatMessage(
            connection,
            `Issue ${createdIssue.number} with the title "${createdIssue.title}" has been created: ${createdIssue.html_url}`,
          );
        }
      }
    }
  },
};
