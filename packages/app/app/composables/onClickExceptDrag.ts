import type { MaybeElementRef } from "@vueuse/core";

export const onClickExceptDrag = (target: MaybeElementRef, handler: (event: PointerEvent) => void) => {
  const elementRef = computed(() => unrefElement(target));
  const isMouseDown = ref(false);
  const isDragging = ref(false);

  const mouseDownListener = () => {
    isMouseDown.value = true;
  };
  const mouseMoveListener = () => {
    if (!isMouseDown.value) return;
    isDragging.value = true;
  };
  const clickListener = (event: PointerEvent) => {
    isMouseDown.value = false;
    if (isDragging.value) isDragging.value = false;
    else handler(event);
  };

  const unsubscribes = [
    useEventListener(elementRef, "mousedown", mouseDownListener),
    useEventListener(elementRef, "mousemove", mouseMoveListener),
    useEventListener(elementRef, "click", clickListener),
  ];

  const stop = () => {
    for (const unsubscribe of unsubscribes) unsubscribe();
  };

  return stop;
};
