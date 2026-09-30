import type { MaybeElementRef } from "@vueuse/core";

import { checkIsNestedInteraction } from "@esposter/shared";

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
  ];

  const stop = () => {
    for (const unsubscribe of unsubscribes) unsubscribe();
  };

  return stop;
};
