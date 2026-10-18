import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { Interactable } from "#src/models/interaction/Interactable";

import { ChestKind } from "#src/models/chest/ChestKind";
import { ChestKindNameKeyMap } from "#src/services/chest/ChestKindNameKeyMap";
import { ChestKindRewardMap } from "#src/services/chest/ChestKindRewardMap";
import { InteractionKind } from "genshin-interface";
import { GameTextKey } from "genshin-text";

// What the character can act on at each chest's place, beneath its point: a buried chest not yet dug offers Dig, and any
// Other chest offers to open once it is rewarded or dug, named by its kind's text. An opened chest, and a sealed one,
// Are not offered
export const computeChestInteractables = (
  chestPlaces: ChestPlace[],
  openedChestIds: ReadonlySet<string>,
  dugChestIds: ReadonlySet<string>,
  gameText: Readonly<Record<string, string>>,
  getGroundHeight: (x: number, z: number) => number,
): Interactable[] =>
  chestPlaces.flatMap(({ id, kind, position: { x, z } }): Interactable[] => {
    if (openedChestIds.has(id)) return [];
    const position = { x, y: getGroundHeight(x, z), z };
    if (kind === ChestKind.Buried && !dugChestIds.has(id))
      return [{ id, kind: InteractionKind.Dig, name: gameText[GameTextKey.Dig] ?? "", position }];
    const nameKey = ChestKindNameKeyMap[kind];
    if (!nameKey || (!ChestKindRewardMap[kind] && !dugChestIds.has(id))) return [];
    return [{ id, kind: InteractionKind.Open, name: gameText[nameKey] ?? "", position }];
  });
