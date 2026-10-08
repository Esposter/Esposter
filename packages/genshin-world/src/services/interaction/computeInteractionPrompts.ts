import type { Interactable } from "#src/models/interaction/Interactable";
import type { InteractionPrompts } from "#src/models/interaction/InteractionPrompts";
import type { Vector3Like } from "three";

import { INTERACTION_REACH, INTERACTION_WINDOW_SIZE } from "#src/services/interaction/constants";
import { MathUtils } from "three";

// This frame's prompts from the last frame's: every thing within reach of the body, nearest first and two at one
// Distance by id, so the rows hold still from frame to frame. The selection stays on its thing while it is in reach and
// Falls to the first row once it leaves, and the window keeps its first row unless the selection has left it, then
// Scrolls just far enough to show it again
export const computeInteractionPrompts = (
  interactables: Interactable[],
  position: Vector3Like,
  { selectedId, windowStart }: Pick<InteractionPrompts, "selectedId" | "windowStart">,
): InteractionPrompts => {
  const reachedInteractables = interactables
    .map((interactable) => ({
      distanceSquared:
        (interactable.position.x - position.x) ** 2 +
        (interactable.position.y - position.y) ** 2 +
        (interactable.position.z - position.z) ** 2,
      interactable,
    }))
    .filter(({ distanceSquared }) => distanceSquared <= INTERACTION_REACH ** 2)
    .toSorted(
      (firstReached, secondReached) =>
        firstReached.distanceSquared - secondReached.distanceSquared ||
        firstReached.interactable.id.localeCompare(secondReached.interactable.id),
    )
    .map(({ interactable }) => interactable);
  const selectedIndex = Math.max(
    reachedInteractables.findIndex(({ id }) => id === selectedId),
    0,
  );
  const lastWindowStart = Math.max(reachedInteractables.length - INTERACTION_WINDOW_SIZE, 0);
  return {
    interactables: reachedInteractables,
    selectedId: reachedInteractables[selectedIndex]?.id ?? "",
    windowStart: MathUtils.clamp(
      MathUtils.clamp(windowStart, selectedIndex - INTERACTION_WINDOW_SIZE + 1, selectedIndex),
      0,
      lastWindowStart,
    ),
  };
};
