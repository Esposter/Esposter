import { getPlainGameText } from "#src/services/genshinText/getPlainGameText";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { GameLanguage, GameLanguages } from "genshin-text";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The texts of the given text ids in every language, written into a directory as one chunk per language by the same ids.
// A language lacking a text takes English's and says so, and a text English lacks too is written empty and listed once.
// Every language is read before the directory's last chunks are removed, so a text map that fails to read leaves them
export const writeTextChunks = (directory: string, textIds: readonly string[]): string[] => {
  const notes: string[] = [];
  const englishTextMap = readTextMap(GameLanguage.English);
  const textIdsWithoutEnglish = textIds.filter((textId) => !englishTextMap.has(textId));
  if (textIdsWithoutEnglish.length > 0)
    notes.push(
      `${textIdsWithoutEnglish.length} texts have no English text; a language that lacks one too writes it empty: ${textIdsWithoutEnglish.join(", ")}`,
    );
  const languageTexts = GameLanguages.map((language) => {
    const textMap = language === GameLanguage.English ? englishTextMap : readTextMap(language);
    const text = Object.fromEntries(
      textIds.map((textId) => {
        const gameText = textMap.get(textId);
        if (!gameText && englishTextMap.has(textId)) notes.push(`${textId} has no ${language} text; English stands in`);
        return [textId, getPlainGameText(gameText || (englishTextMap.get(textId) ?? ""))];
      }),
    );
    return [language, text] as const;
  });
  rmSync(directory, { force: true, recursive: true });
  mkdirSync(directory, { recursive: true });
  for (const [language, text] of languageTexts)
    writeFileSync(join(directory, `${language}.json`), JSON.stringify(text));

  return notes;
};
