import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { KitBody } from "#src/models/kit/KitBody";
import type { Wildlife } from "#src/models/wildlife/Wildlife";

import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { strikeWildlife } from "#src/services/wildlife/strikeWildlife";

// Strikes the animals a hit's area reaches, by the test an enemy takes: each animal in the area falls and gives its
// Drop, if it gives one, where it fell. One already struck gives nothing, and one out of the area is left as it is
export const strikeKitWildlife = (
  area: AttackArea,
  body: KitBody,
  wildlifeList: Wildlife[],
  placeWildlifeDrops: (wildlife: Wildlife, droppedItems: DroppedItem[]) => void,
): void => {
  for (const wildlife of wildlifeList) {
    if (!checkIsInAttackArea(area, body, wildlife)) continue;
    const droppedItem = strikeWildlife(wildlife);
    if (droppedItem) placeWildlifeDrops(wildlife, [droppedItem]);
  }
};
