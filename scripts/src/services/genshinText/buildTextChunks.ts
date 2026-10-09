import type { GameDataset } from "genshin-world";

import { getPlainGameText } from "#src/services/genshinText/getPlainGameText";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { GameLanguage, GameLanguages } from "genshin-text";

// The texts of the given text ids, one record a language under the dataset, keyed `<dataset>/<language>`, each holding
// Every text by its id. A language lacking a text takes English's and says so. A text English lacks is published empty,
// And listed once in the notes
export const buildTextChunks = (
  dataset: GameDataset,
  textIds: readonly string[],
): { notes: string[]; objects: Record<string, unknown> } => {
  const notes: string[] = [];
  const englishTextMap = readTextMap(GameLanguage.English);
  const textIdsWithoutEnglish = textIds.filter((textId) => !englishTextMap.has(textId));
  if (textIdsWithoutEnglish.length > 0)
    notes.push(
      `${textIdsWithoutEnglish.length} texts have no English text; a language that lacks one too publishes it empty: ${textIdsWithoutEnglish.join(", ")}`,
    );
  const objects = Object.fromEntries(
    GameLanguages.map((language) => {
      const textMap = language === GameLanguage.English ? englishTextMap : readTextMap(language);
      const text = Object.fromEntries(
        textIds.map((textId) => {
          const gameText = textMap.get(textId);
          if (!gameText && englishTextMap.has(textId))
            notes.push(`${textId} has no ${language} text; English stands in`);
          return [textId, getPlainGameText(gameText || (englishTextMap.get(textId) ?? ""))];
        }),
      );
      return [`${dataset}/${language}`, text] as const;
    }),
  );
  return { notes, objects };
};
