import type { AbyssBenedictionChoice } from "genshin-world";

import { InvalidOperationError, Operation } from "@esposter/shared";

// One choice of a chamber's list, a Benediction id and its weight written as `id:weight`
const CHOICE_PATTERN = /^(?<towerBuffId>\d+):(?<weight>\d+)$/u;

// The Benedictions a chamber's three lists offer, read off the level row's list strings, each a comma separated run of
// `id:weight` choices. A chamber without three lists, or a choice that is not an id and a weight, is refused rather than read
// Short or dropped
export const toAbyssBenedictionChoices = (levelId: number, lists: readonly string[]): AbyssBenedictionChoice[][] => {
  if (lists.length !== 3)
    throw new InvalidOperationError(
      Operation.Read,
      String(levelId),
      `has ${lists.length} Benediction lists, not three`,
    );
  return lists.map((list) =>
    list.split(",").map((choice) => {
      const match = CHOICE_PATTERN.exec(choice);
      if (!match?.groups)
        throw new InvalidOperationError(
          Operation.Read,
          String(levelId),
          `has a Benediction choice ${choice} that is not an id and a weight`,
        );
      return { towerBuffId: Number(match.groups.towerBuffId), weight: Number(match.groups.weight) };
    }),
  );
};
