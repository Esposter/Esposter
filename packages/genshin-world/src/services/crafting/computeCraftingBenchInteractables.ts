import type { Interactable } from "#src/models/interaction/Interactable";
import type { CraftingBenchPlace } from "#src/models/crafting/CraftingBenchPlace";

import { CRAFTING_BENCH_INTERACTABLE_ID } from "#src/services/crafting/constants";
import { InteractionKind } from "genshin-interface";

// The bench as a row of the prompts, used on the ground beneath its place and named by the game's own text. A city
// With no bench in its scene group record offers none
export const computeCraftingBenchInteractables = (
  place: CraftingBenchPlace | undefined,
  name: string,
  getGroundHeight: (x: number, z: number) => number,
): Interactable[] => {
  if (!place) return [];
  const { x, z } = place.position;
  return [
    {
      id: CRAFTING_BENCH_INTERACTABLE_ID,
      kind: InteractionKind.Use,
      name,
      position: { x, y: getGroundHeight(x, z), z },
    },
  ];
};
