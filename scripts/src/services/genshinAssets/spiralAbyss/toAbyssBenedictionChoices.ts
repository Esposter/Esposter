import type { AbyssBenedictionChoice } from "genshin-world";

import { InvalidOperationError, Operation } from "@esposter/shared";

// One choice of a chamber's list, a Benediction id and its weight written as `id:weight`
const CHOICE_REGEX = /^(?<towerBuffId>\d+):(?<weight>\d+)$/u;

// The Benedictions a chamber's three lists offer, read off the level row's list strings, each a comma separated run of
// `id:weight` choices, and each joined to its description's text hash by the tower buff table. A chamber without three lists,
// A choice that is not an id and a weight, or a Benediction the buff table does not hold is refused rather than read short
// Or dropped
export const toAbyssBenedictionChoices = (
  levelId: number,
  lists: readonly string[],
  descriptionTextHashes: ReadonlyMap<number, number>,
): AbyssBenedictionChoice[][] => {
  if (lists.length !== 3)
    throw new InvalidOperationError(
      Operation.Read,
      String(levelId),
      `has ${lists.length} Benediction lists, not three`,
    );
  return lists.map((list) =>
    list.split(",").map((choice) => {
      const match = CHOICE_REGEX.exec(choice);
      if (!match?.groups)
        throw new InvalidOperationError(
          Operation.Read,
          String(levelId),
          `has a Benediction choice ${choice} that is not an id and a weight`,
        );
      const towerBuffId = Number(match.groups.towerBuffId);
      const descriptionTextHash = descriptionTextHashes.get(towerBuffId);
      if (descriptionTextHash === undefined)
        throw new InvalidOperationError(
          Operation.Read,
          String(levelId),
          `has a Benediction ${towerBuffId} the buff table does not hold`,
        );
      return { descriptionTextHash, towerBuffId, weight: Number(match.groups.weight) };
    }),
  );
};
