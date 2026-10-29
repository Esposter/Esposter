import type { GameTextMatch } from "#src/models/genshinText/GameTextMatch";
import type { GameLanguage } from "genshin-text";

import { GameLanguageTagMap } from "genshin-text";

// A match as one line: its JSON when asked for, else its name or, where it has none, its id, then the GameTextKey member
// that takes it where one does, then each language's string in the order the languages were asked for, a string the
// match lacks left as an empty one
export const formatGameTextMatch = (match: GameTextMatch, languages: GameLanguage[], isJson: boolean): string => {
  if (isJson) return JSON.stringify(match);

  const keyMember = match.key === undefined ? [] : [match.key];
  const texts = languages.map((language) => JSON.stringify(match.values[GameLanguageTagMap[language]] || ""));
  return [match.name || match.id, ...keyMember, ...texts].join("\t");
};
