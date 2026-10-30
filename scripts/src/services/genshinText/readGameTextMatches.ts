import type { GameTextMatch } from "#src/models/genshinText/GameTextMatch";

import { collectGameTextMatches } from "#src/services/genshinText/collectGameTextMatches";
import { readManualTextMap } from "#src/services/genshinText/readManualTextMap";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { GameLanguage, GameLanguageTagMap } from "genshin-text";

// The English strings the predicate matches, each with its text in every language asked for.
// Each language's map is read once, and only when something matched.
// The English map that matching reads is the one English is filled from
export const readGameTextMatches = (
  checkIsMatch: (text: string, ids: string[]) => boolean,
  languages: GameLanguage[],
): GameTextMatch[] => {
  const englishTextMap = readTextMap(GameLanguage.English);
  const matches = collectGameTextMatches(englishTextMap, readManualTextMap(), checkIsMatch);
  if (matches.length === 0) return matches;

  for (const language of languages) {
    const textMap = language === GameLanguage.English ? englishTextMap : readTextMap(language);
    for (const match of matches) match.values[GameLanguageTagMap[language]] = textMap.get(match.id) || "";
  }

  return matches;
};
