import type { GameTextMatch } from "#src/models/genshinText/GameTextMatch";
import type { GameLanguage } from "genshin-text";

import { GameLanguageTagMap } from "genshin-text";

// A match as one line: its JSON when asked for, else its name or, where it has none, its id.
// Then comes the GameTextKey member that takes it, where one does.
// Then each language's string follows, in the order the languages were asked for.
// A string the match lacks is left as an empty one
export const formatGameTextMatch = (match: GameTextMatch, languages: GameLanguage[], isJson: boolean): string => {
  if (isJson) return JSON.stringify(match);

  const keyMember = match.key === undefined ? [] : [match.key];
  const texts = languages.map((language) => JSON.stringify(match.values[GameLanguageTagMap[language]] || ""));
  return [match.name || match.id, ...keyMember, ...texts].join("\t");
};
