import type { CharacterData, WeaponData } from "genshin-world";

import { STATS_GENERATED_DIRECTORY } from "#src/services/genshinAssets/stats/constants";
import { NAME_TEXT_DIRECTORY } from "#src/services/genshinText/constants";
import { getPlainGameText } from "#src/services/genshinText/getPlainGameText";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { GameLanguage, GameLanguages } from "genshin-text";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Every name the world's stat tables cite by text id, each character's and each weapon's, as `genshin:assets stats`
// Last wrote them, into the world's own chunk per language; a name a language lacks takes English's and says so
export const writeNames = (): string[] => {
  const notes: string[] = [];
  const datas = ["characters.json", "weapons.json"].flatMap((fileName) =>
    parseMachineJson<(CharacterData | WeaponData)[]>(readFileSync(join(STATS_GENERATED_DIRECTORY, fileName), "utf8")),
  );
  const textIds = [...new Set(datas.map(({ nameTextId }) => nameTextId))].toSorted();
  rmSync(NAME_TEXT_DIRECTORY, { force: true, recursive: true });
  mkdirSync(NAME_TEXT_DIRECTORY, { recursive: true });

  const englishTextMap = readTextMap(GameLanguage.English);
  for (const language of GameLanguages) {
    const textMap = language === GameLanguage.English ? englishTextMap : readTextMap(language);
    const nameText = Object.fromEntries(
      textIds.map((textId) => {
        const text = textMap.get(textId);
        if (!text) notes.push(`${textId} has no ${language} text; English stands in`);
        return [textId, getPlainGameText(text ?? englishTextMap.get(textId) ?? "")];
      }),
    );
    writeFileSync(join(NAME_TEXT_DIRECTORY, `${language}.json`), `${JSON.stringify(nameText, undefined, 2)}\n`);
  }

  notes.push(`${textIds.length} names written in ${GameLanguages.length} languages`);
  return notes;
};
