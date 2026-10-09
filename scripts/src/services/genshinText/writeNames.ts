import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { GENSHIN_WORLD_GENERATED_DIRECTORY, NAME_TEXT_DIRECTORY } from "#src/services/genshinText/constants";
import { getPlainGameText } from "#src/services/genshinText/getPlainGameText";
import { readNameTextIds } from "#src/services/genshinText/readNameTextIds";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { GameLanguage, GameLanguages } from "genshin-text";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

// Every name the world's data cites by text id is written into the world's own chunk per language. The ids are every
// `nameTextId` in the data and generated folders, found by `readNameTextIds`, so a new source needs no entry here.
// A name a language lacks takes English's and says so.
export const writeNames = (): string[] => {
  const notes: string[] = [];
  const textIds = readNameTextIds([WORLD_DATA_DIRECTORY, GENSHIN_WORLD_GENERATED_DIRECTORY], NAME_TEXT_DIRECTORY);
  const englishTextMap = readTextMap(GameLanguage.English);
  // Every language is read before the last run's chunks are removed, so a text map that fails to read leaves them
  const languageNameTexts = GameLanguages.map((language) => {
    const textMap = language === GameLanguage.English ? englishTextMap : readTextMap(language);
    const nameText = Object.fromEntries(
      textIds.map((textId) => {
        const text = textMap.get(textId);
        if (!text) notes.push(`${textId} has no ${language} text; English stands in`);
        return [textId, getPlainGameText(text || (englishTextMap.get(textId) ?? ""))];
      }),
    );
    return [language, nameText] as const;
  });
  rmSync(NAME_TEXT_DIRECTORY, { force: true, recursive: true });
  mkdirSync(NAME_TEXT_DIRECTORY, { recursive: true });
  for (const [language, nameText] of languageNameTexts)
    writeJsonFile(join(NAME_TEXT_DIRECTORY, `${language}.json`), nameText);

  notes.push(`${textIds.length} names written in ${GameLanguages.length} languages`);
  return notes;
};
