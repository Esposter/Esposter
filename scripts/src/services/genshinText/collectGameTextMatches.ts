import type { GameTextMatch } from "#src/models/genshinText/GameTextMatch";

import { GameTextKey } from "genshin-text";

// Every English string the predicate matches, filed under its hash.
// Where the manual text map names that hash, the match takes the name, and the GameTextKey member that takes it.
// The named ones come first.
// The predicate is handed the names a string is filed under, or its hash where there are none.
// That is how a screen's own strings are found by id
export const collectGameTextMatches = (
  englishTextMap: Map<string, string>,
  manualTextMap: Map<string, string>,
  checkIsMatch: (text: string, ids: string[]) => boolean,
): GameTextMatch[] => {
  const namesByHash = Map.groupBy(manualTextMap, ([, hash]) => hash);
  const keyMembers = new Map<string, string>(
    Object.entries(GameTextKey).map(([member, value]): [string, string] => [value, member]),
  );
  const matches: GameTextMatch[] = [];
  for (const [hash, text] of englishTextMap) {
    const names = (namesByHash.get(hash) ?? []).map(([name]) => name);
    const ids = names.length > 0 ? names : [hash];
    if (checkIsMatch(text, ids)) {
      const match: GameTextMatch = { id: hash, values: {} };
      if (names.length > 0) match.name = names.join(", ");
      const keyMember = ids.map((id) => keyMembers.get(id)).find((member) => member !== undefined);
      if (keyMember !== undefined) match.key = keyMember;
      matches.push(match);
    }
  }

  return matches.toSorted(
    (firstMatch, secondMatch) => Number(secondMatch.name !== undefined) - Number(firstMatch.name !== undefined),
  );
};
