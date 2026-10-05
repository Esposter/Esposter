import { readManualTextMap } from "#src/services/genshinText/readManualTextMap";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { GameLanguage } from "genshin-text";

// Every English string matching the pattern, as the id a `GameTextKey` takes — the game's own name for it where the
// Manual text map files one, else the hash — beside the text, the named ones first since an interface string is
// What a key is usually after
export const findGameText = (pattern: string): string[] => {
  const regex = new RegExp(pattern, "u");
  const hashManualEntriesMap = Map.groupBy(readManualTextMap(), ([, hash]) => hash);
  const matches = [...readTextMap(GameLanguage.English)]
    .filter(([, text]) => regex.test(text))
    .map(([hash, text]) => {
      const ids = (hashManualEntriesMap.get(hash) ?? []).map(([id]) => id);
      return { id: ids.join(", ") || hash, isNamed: ids.length > 0, text };
    });
  return matches
    .toSorted((firstMatch, secondMatch) => Number(secondMatch.isNamed) - Number(firstMatch.isNamed))
    .map(({ id, text }) => `${id}\t${JSON.stringify(text)}`);
};
