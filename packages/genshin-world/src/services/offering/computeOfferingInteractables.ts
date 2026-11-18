import type { Interactable } from "#src/models/interaction/Interactable";
import type { OfferingLandmark } from "#src/models/world/OfferingLandmark";

import { OfferingKindNameKeyMap } from "#src/services/offering/OfferingKindNameKeyMap";
import { InteractionKind } from "genshin-interface";

// Each offering the loaded regions stand as an Activate interactable on the ground beneath its point, named by its kind's
// Text, which the prompt list keeps to those in reach. Which activation offers the bag is the interaction dispatch's
export const computeOfferingInteractables = (
  offeringLandmarks: OfferingLandmark[],
  gameText: Readonly<Record<string, string>>,
  getGroundHeight: (x: number, z: number) => number,
): Interactable[] =>
  offeringLandmarks.map(({ id, offeringKind, position: { x, z } }) => {
    const nameKey = OfferingKindNameKeyMap[offeringKind];
    return {
      id,
      kind: InteractionKind.Activate,
      name: nameKey === undefined ? "" : (gameText[nameKey] ?? ""),
      position: { x, y: getGroundHeight(x, z), z },
    };
  });
