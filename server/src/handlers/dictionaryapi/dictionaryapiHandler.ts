import fetch from 'node-fetch';
import { z } from 'zod';
import Config from '../../config';
import { logger } from '../../logger';

const definitionResponseSchema = z.array(
  z.object({
    word: z.string(),
    phonetics: z.array(
      z.object({
        text: z.optional(z.string()),
        audio: z.string(),
        sourceUrl: z.optional(z.string()),
        license: z.optional(
          z.object({
            name: z.string(),
            url: z.string(),
          }),
        ),
      }),
    ),
    meanings: z.array(
      z.object({
        partOfSpeech: z.string(),
        definitions: z.array(
          z.object({
            definition: z.string(),
            synonyms: z.optional(z.array(z.string())),
            antonyms: z.optional(z.array(z.string())),
            example: z.optional(z.string()),
          }),
        ),
        synonyms: z.array(z.string()),
        antonyms: z.array(z.string()),
      }),
    ),
    license: z.object({
      name: z.string(),
      url: z.string(),
    }),
    sourceUrls: z.array(z.string()),
  }),
);

type DefinitionResponse = z.infer<typeof definitionResponseSchema>;

export const defineWord = async (word: string): Promise<DefinitionResponse | null> => {
  // Check that it is a valid word
  if (!word.match(/^[a-zA-Z]+$/)) {
    return null;
  }

  if (Config.tiktok.session_id) {
    try {
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
      const response = await fetch(url, {
        method: 'GET',
      });

      const result = await response.json();

      const definitionParse = definitionResponseSchema.safeParse(result);
      if (definitionParse.success) {
        return definitionParse.data;
      } else {
        logger.error(`JSON response from Dictionary API is not valid: Error: ${definitionParse.error.message}`);
      }
    } catch (error) {
      logger.error(error);
    }
  }
  return null;
};
