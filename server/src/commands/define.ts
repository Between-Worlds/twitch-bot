import { defineWord } from '../handlers/dictionaryapi/dictionaryapiHandler';
import type { BotCommand } from '../types';
import { hasBotCommandParams } from './helpers/hasBotCommandParams';
import { sendChatMessage } from './helpers/sendChatMessage';

export const define: BotCommand = {
  command: ['define'],
  id: 'define',
  description: 'define a word, like !define hello',
  callback: async (connection, parsedCommand) => {
    if (hasBotCommandParams(parsedCommand.parsedMessage)) {
      const userInput = parsedCommand.parsedMessage.command?.botCommandParams.split(' ')[0];
      if (!userInput) {
        sendChatMessage(connection, 'You need to specify a word to get definition for, like !define hello');
        return;
      }
      const wordDefinitions = await defineWord(userInput);
      if (!wordDefinitions) {
        sendChatMessage(connection, "I don't know about that word");
        return;
      }

      let wordToDefine = 0;
      if (wordDefinitions.length > 1) {
        const meaningChosen = parsedCommand.parsedMessage.command?.botCommandParams.split(' ')[1] || '1';
        wordToDefine = Number(meaningChosen);
        if (isNaN(wordToDefine)) {
          wordToDefine = 0;
        } else {
          // Reduce by 1 as the user will send in 1 when they want to get the first definition
          wordToDefine--;
        }
      }

      if (wordToDefine >= wordDefinitions.length) {
        wordToDefine = 0;
      }

      const definition = wordDefinitions[wordToDefine];

      const middle = definition.meanings.map(
        (meaning, index) => `${index + 1}. (${meaning.partOfSpeech}) - ${meaning.definitions.map((definition) => definition.definition).join(' ')}`,
      );

      const definitionCount = wordDefinitions.length > 1 ? `(definition ${wordToDefine + 1} of ${wordDefinitions.length})` : '';

      const phonetic = definition.phonetics.find((phonetic) => phonetic.text && phonetic.text !== '');

      const message = `${definition.word} ${phonetic?.text} ${middle.join(' ')} ${definitionCount}`;

      sendChatMessage(connection, message);
    } else {
      sendChatMessage(connection, 'You need to specify a word to get a definition for, like !define hello');
    }
  },
  cooldown: 1000,
};
