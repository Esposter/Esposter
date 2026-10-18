import type { Interactable } from "#src/models/interaction/Interactable";
import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";

import { COOKING_STOVE_INTERACTABLE_ID } from "#src/services/cooking/constants";
import { InteractionKind } from "genshin-interface";

// The stove as a row of the prompts, activated on the ground beneath its place and named by the game's own text. A city
// With no stove in its scene group record offers none. It takes no campfire, so it is used whether or not a fire is lit
export const computeCookingStoveInteractables = (
  place: SceneGroupPlace | undefined,
  name: string,
  getGroundHeight: (x: number, z: number) => number,
): Interactable[] => {
  if (!place) return [];
  const { x, z } = place.position;
  return [
    {
      id: COOKING_STOVE_INTERACTABLE_ID,
      kind: InteractionKind.Activate,
      name,
      position: { x, y: getGroundHeight(x, z), z },
    },
  ];
};
