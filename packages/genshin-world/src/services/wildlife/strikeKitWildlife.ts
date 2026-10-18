import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { KitBody } from "#src/models/kit/KitBody";
import type { Wildlife } from "#src/models/wildlife/Wildlife";

import { WildlifeState } from "#src/models/wildlife/WildlifeState";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { strikeWildlife } from "#src/services/wildlife/strikeWildlife";

// Strikes the animals a hit's area reaches, by the test an enemy takes: each animal in the area falls and gives its
// Drop, if it gives one, where it fell. One already struck gives nothing, and one out of the area is left as it is. The
// Animals this hit felled are returned, for the kits to hear
export const strikeKitWildlife = (
  area: AttackArea,
  body: KitBody,
  wildlifeList: Wildlife[],
  placeWildlifeDrops: (wildlife: Wildlife, droppedItems: DroppedItem[]) => void,
): Wildlife[] => {
  const struckWildlife: Wildlife[] = [];
  for (const wildlife of wildlifeList) {
    if (!checkIsInAttackArea(area, body, wildlife) || wildlife.state === WildlifeState.Struck) continue;
    const droppedItem = strikeWildlife(wildlife);
    struckWildlife.push(wildlife);
    if (droppedItem) placeWildlifeDrops(wildlife, [droppedItem]);
  }
  return struckWildlife;
};
