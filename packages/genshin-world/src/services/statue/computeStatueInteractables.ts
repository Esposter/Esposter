import type { Interactable } from "#src/models/interaction/Interactable";
import type { Landmark } from "#src/models/world/Landmark";

import { getStatueRegionId } from "#src/services/statue/getStatueRegionId";
import { InteractionKind } from "genshin-interface";

// The unlocked Statues of The Seven, each an activation the caller names Worship: F on a resonated statue opens the
// Worship screen, where a statue not yet resonated with is resonated with on the key instead
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
