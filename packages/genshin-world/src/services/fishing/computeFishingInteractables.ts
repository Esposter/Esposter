import type { FishingPointPlace } from "#src/models/fishing/FishingPointPlace";
import type { Interactable } from "#src/models/interaction/Interactable";

import { InteractionKind } from "genshin-interface";
import { GameTextKey } from "genshin-text";

// Each fishing point offered as a row to cast from, named by the game's fishing text, while fishing is open. The point
// Stands on the water, so its row stands at the height the caller gives it and not at the ground beneath it
export const computeFishingInteractables = (
  fishingPoints: FishingPointPlace[],
  isFishingOpen: boolean,
  gameText: Readonly<Record<string, string>>,
  getHeight: (x: number, z: number) => number,
): Interactable[] =>
  isFishingOpen
    ? fishingPoints.map(({ id, position: { x, z } }) => ({
        id,
        kind: InteractionKind.Use,
        name: gameText[GameTextKey.Fishing] ?? "",
        position: { x, y: getHeight(x, z), z },
      }))
    : [];
