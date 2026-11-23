import type { Interactable } from "#src/models/interaction/Interactable";
import type { GroundPoint } from "genshin-engine";

import { InteractionKind } from "genshin-interface";

// A place's row of the prompts, used on the ground beneath it and named by the game's own text. A place the scene group
// Record does not hold offers none
export const computePlaceInteractables = (
  id: string,
  place: { position: GroundPoint } | undefined,
  name: string,
  getGroundHeight: (x: number, z: number) => number,
): Interactable[] => {
  if (!place) return [];
  const { x, z } = place.position;
  return [{ id, kind: InteractionKind.Use, name, position: { x, y: getGroundHeight(x, z), z } }];
};
