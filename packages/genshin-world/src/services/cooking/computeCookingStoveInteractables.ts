import type { Interactable } from "#src/models/interaction/Interactable";
import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";

import { COOKING_PROCESSING_INTERACTABLE_ID, COOKING_STOVE_INTERACTABLE_ID } from "#src/services/cooking/constants";
import { InteractionKind } from "genshin-interface";

// The stove as two rows of the prompts, cooking and processing, each activated on the ground beneath its place and named
// By the game's own text. A city with no stove in its scene group record offers none. It takes no campfire, so it is
// Used whether or not a fire is lit
export const computeCookingStoveInteractables = (
  place: SceneGroupPlace | undefined,
  names: { cooking: string; processing: string },
  getGroundHeight: (x: number, z: number) => number,
): Interactable[] => {
  if (!place) return [];
  const { x, z } = place.position;
  const position = { x, y: getGroundHeight(x, z), z };
  return [
    { id: COOKING_STOVE_INTERACTABLE_ID, kind: InteractionKind.Activate, name: names.cooking, position },
    { id: COOKING_PROCESSING_INTERACTABLE_ID, kind: InteractionKind.Activate, name: names.processing, position },
  ];
};
