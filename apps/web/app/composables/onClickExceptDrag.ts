import type { MaybeElementRef } from "@vueuse/core";

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
      else handler(event);
    }),
  ];

  const stop = () => {
    for (const unsubscribe of unsubscribes) unsubscribe();
  };

  return stop;
};
