import { readManualTextMap } from "#src/services/genshinText/readManualTextMap";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { GameLanguage } from "genshin-text";

// Every English string matching the pattern, as the id a `GameTextKey` takes — the game's own name for it where the
// Manual text map files one, else the hash — beside the text, the named ones first since an interface string is
// What a key is usually after. With isIdPattern, the pattern is read against that id instead, which lists a screen's own
// Strings by their shared prefix where their words are too common to search for
export const findGameText = (pattern: string, isIdPattern = false): string[] => {
  const regex = new RegExp(pattern, "u");
  const hashManualEntriesMap = Map.groupBy(readManualTextMap(), ([, hash]) => hash);
  const matches = Array.from(readTextMap(GameLanguage.English), ([hash, text]) => {
    const ids = (hashManualEntriesMap.get(hash) ?? []).map(([id]) => id);
    return { id: ids.join(", ") || hash, isNamed: ids.length > 0, text };
  }).filter(({ id, text }) => regex.test(isIdPattern ? id : text));
  return matches
    .toSorted((firstMatch, secondMatch) => Number(secondMatch.isNamed) - Number(firstMatch.isNamed))
    .map(({ id, text }) => `${id}\t${JSON.stringify(text)}`);
};
