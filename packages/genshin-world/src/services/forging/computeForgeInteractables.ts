import type { Interactable } from "#src/models/interaction/Interactable";
import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";

import { FORGE_INTERACTABLE_ID } from "#src/services/forging/constants";
import { InteractionKind } from "genshin-interface";

// The blacksmith as a row of the prompts, used on the ground beneath its place and named by the game's own text. A city
// With no blacksmith in its scene group record offers none
export const computeForgeInteractables = (
  place: SceneGroupPlace | undefined,
  name: string,
  getGroundHeight: (x: number, z: number) => number,
): Interactable[] => {
  if (!place) return [];
  const { x, z } = place.position;
  return [{ id: FORGE_INTERACTABLE_ID, kind: InteractionKind.Use, name, position: { x, y: getGroundHeight(x, z), z } }];
};
