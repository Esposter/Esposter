import type { Interactable } from "#src/models/interaction/Interactable";
import type { Landmark } from "#src/models/world/Landmark";

import { getStatueRegionId } from "#src/services/statue/getStatueRegionId";
import { InteractionKind } from "genshin-interface";

// The unlocked Statues of The Seven, each an Activate interactable under the name the caller gives it. Which activation
// Opens the Worship screen is the interaction dispatch's: a resonated statue's, while one not yet resonated with resonates
export const computeStatueInteractables = (
  unlockedLandmarks: Landmark[],
  name: string,
  getGroundHeight: (x: number, z: number) => number,
): Interactable[] =>
  unlockedLandmarks.flatMap(({ id, position: { x, z } }) =>
    getStatueRegionId(id) === undefined
      ? []
      : [{ id, kind: InteractionKind.Activate, name, position: { x, y: getGroundHeight(x, z), z } }],
  );
