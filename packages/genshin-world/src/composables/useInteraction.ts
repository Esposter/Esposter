import type { Interactable } from "#src/models/interaction/Interactable";
import type { InteractionPrompts } from "#src/models/interaction/InteractionPrompts";
import type { InputState } from "genshin-engine";
import type { Object3D } from "three";

import { computeInteractionPrompts } from "#src/services/interaction/computeInteractionPrompts";
import { INTERACTION_HELD_REPEAT_SECONDS } from "#src/services/interaction/constants";
import { getHeldPickUp } from "#src/services/interaction/getHeldPickUp";
import { stepInteractionSelection } from "#src/services/interaction/stepInteractionSelection";
import { InputAction } from "genshin-engine";
import { shallowRef } from "vue";

// The prompts beside the character, read each frame from what is in reach of its body. The rows, the selection and the
// Window are handed on only when one of them changed, so a still player re-renders nothing. A press acts on the selected
// Row, and while Interact stays held each interval picks up what a held F picks up
export const useInteraction = (getInteractables: () => Interactable[], body: Object3D) => {
  const interactionPrompts = shallowRef<InteractionPrompts>({ interactables: [], selectedId: "", windowStart: 0 });
  let heldSeconds = 0;
  const readInteraction = (inputState: InputState, frameSeconds: number): Interactable | undefined => {
    const interactables = getInteractables();
    if (interactables.length === 0 && interactionPrompts.value.interactables.length === 0) {
      heldSeconds = 0;
      return undefined;
    }

    let prompts = computeInteractionPrompts(interactables, body.position, interactionPrompts.value);
    // The wheel steps the rows while more than one shows, and the camera is spared the notches it spent
    if (prompts.interactables.length > 1 && inputState.zoomSteps !== 0) {
      const selectedId = stepInteractionSelection(prompts, inputState.zoomSteps);
      inputState.zoomSteps = 0;
      prompts = computeInteractionPrompts(interactables, body.position, {
        selectedId,
        windowStart: prompts.windowStart,
      });
    }

    const { interactables: rows, selectedId, windowStart } = interactionPrompts.value;
    const isUnchanged =
      selectedId === prompts.selectedId &&
      windowStart === prompts.windowStart &&
      rows.length === prompts.interactables.length &&
      rows.every(({ id }, index) => id === prompts.interactables[index]?.id);
    if (!isUnchanged) interactionPrompts.value = prompts;

    if (inputState.pressedActions.has(InputAction.Interact)) {
      heldSeconds = 0;
      return prompts.interactables.find(({ id }) => id === prompts.selectedId);
    }
    if (!inputState.heldActions.has(InputAction.Interact)) {
      heldSeconds = 0;
      return undefined;
    }
    heldSeconds += frameSeconds;
    if (heldSeconds < INTERACTION_HELD_REPEAT_SECONDS) return undefined;
    heldSeconds -= INTERACTION_HELD_REPEAT_SECONDS;
    return getHeldPickUp(prompts);
  };

  return { interactionPrompts, readInteraction };
};
