import type { MaybeElementRef } from "@vueuse/core";

import { checkIsNestedInteraction } from "@esposter/shared";
import { defaultWindow } from "@vueuse/core";

// A click on the element that was not the end of a drag, nor a click on something inside it that is its own
export const onClickExceptDrag = (target: MaybeElementRef, handler: (event: PointerEvent) => void) => {
  const elementRef = computed(() => unrefElement(target));
  const isMouseDown = ref(false);
  const isDragging = ref(false);

  const unsubscribes = [
    useEventListener(elementRef, "mousedown", () => {
      isMouseDown.value = true;
    }),
    useEventListener(elementRef, "mousemove", () => {
      if (!isMouseDown.value) return;
      isDragging.value = true;
    }),
    useEventListener(elementRef, "click", (event: PointerEvent) => {
      isMouseDown.value = false;
      if (isDragging.value) isDragging.value = false;
      else if (!checkIsNestedInteraction(event)) handler(event);
    }),
    // A press released off the element sends it no click, so the release ends the press here. A drag that left the
    // Element ends with it too, rather than swallowing the next click on the element
    useEventListener(defaultWindow, "mouseup", (event) => {
      isMouseDown.value = false;
      const isReleasedOnElement = event.target instanceof Node && Boolean(elementRef.value?.contains(event.target));
      if (!isReleasedOnElement) isDragging.value = false;
    }),
  ];

  const stop = () => {
    for (const unsubscribe of unsubscribes) unsubscribe();
  };

  return stop;
};
