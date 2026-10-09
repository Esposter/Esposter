import type { CharacterData, WeaponData } from "genshin-world";

import { COOKING_RECIPES_PATH, PROCESSING_RECIPES_PATH } from "#src/services/genshinAssets/cooking/constants";
import { CRAFTING_RECIPES_PATH } from "#src/services/genshinAssets/crafting/constants";
import { ENEMY_KINDS_PATH } from "#src/services/genshinAssets/enemies/constants";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { STATS_GENERATED_DIRECTORY } from "#src/services/genshinAssets/stats/constants";
import { NAME_TEXT_DIRECTORY } from "#src/services/genshinText/constants";
import { getPlainGameText } from "#src/services/genshinText/getPlainGameText";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { GameLanguage, GameLanguages } from "genshin-text";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Every name the world cites by text id: each character's, each weapon's and each enemy kind's, as `genshin:assets stats`
// And `genshin:assets enemies` last wrote them, and each dish's, processing's and crafted item's, as `genshin:assets
// Cooking` and `crafting` last wrote them, into the world's own chunk per language. A name a language lacks takes
// English's and says so
export const writeNames = (): string[] => {
  const notes: string[] = [];
  const datas = ["characters.json", "weapons.json"].flatMap((fileName) =>
    parseMachineJson<(CharacterData | WeaponData)[]>(readFileSync(join(STATS_GENERATED_DIRECTORY, fileName), "utf8")),
  );
  const enemyKinds = parseMachineJson<{ nameTextId: string }[]>(
    readFileSync(join(WORLD_DATA_DIRECTORY, ENEMY_KINDS_PATH), "utf8"),
  );
  const recipes = [CRAFTING_RECIPES_PATH, COOKING_RECIPES_PATH, PROCESSING_RECIPES_PATH].flatMap((path) =>
    parseMachineJson<{ nameTextId: string }[]>(readFileSync(path, "utf8")),
  );
  const textIds = [...new Set([...datas, ...enemyKinds, ...recipes].map(({ nameTextId }) => nameTextId))].toSorted();
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
    writeFileSync(join(NAME_TEXT_DIRECTORY, `${language}.json`), `${JSON.stringify(nameText, undefined, 2)}\n`);

  notes.push(`${textIds.length} names written in ${GameLanguages.length} languages`);
  return notes;
};
