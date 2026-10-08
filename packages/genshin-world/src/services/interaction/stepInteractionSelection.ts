import type { InteractionPrompts } from "#src/models/interaction/InteractionPrompts";

import { MathUtils } from "three";

// The id a turn of the mouse wheel selects: a row down the list for each notch of a positive step and a row up for each
// Of a negative one, stopping at either end without wrapping. The window follows on the next frame's prompts
export const stepInteractionSelection = ({ interactables, selectedId }: InteractionPrompts, step: number): string => {
  const selectedIndex = interactables.findIndex(({ id }) => id === selectedId);
  const nextIndex = MathUtils.clamp(selectedIndex + step, 0, interactables.length - 1);
  return interactables[nextIndex]?.id ?? "";
};
