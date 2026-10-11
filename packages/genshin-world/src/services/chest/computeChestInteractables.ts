import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { Interactable } from "#src/models/interaction/Interactable";

import { ChestKindNameKeyMap } from "#src/services/chest/ChestKindNameKeyMap";
import { ChestKindRewardMap } from "#src/services/chest/ChestKindRewardMap";
import { InteractionKind } from "genshin-interface";

// Each unopened chest of a rewarded kind, offered as a row to open on the ground beneath its point, named by its kind's
// Text. A chest opened, or of a kind the wallet does not reward yet, is not offered
export const computeChestInteractables = (
  chestPlaces: ChestPlace[],
  openedChestIds: ReadonlySet<string>,
  gameText: Readonly<Record<string, string>>,
  getGroundHeight: (x: number, z: number) => number,
): Interactable[] =>
  chestPlaces.flatMap(({ id, kind, position: { x, z } }) => {
    const nameKey = ChestKindNameKeyMap[kind];
    if (!nameKey || !ChestKindRewardMap[kind] || openedChestIds.has(id)) return [];
    return [{ id, kind: InteractionKind.Open, name: gameText[nameKey], position: { x, y: getGroundHeight(x, z), z } }];
  });
