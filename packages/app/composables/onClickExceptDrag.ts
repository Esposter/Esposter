import type { MaybeElementRef } from "@vueuse/core";

export const onClickExceptDrag = (target: MaybeElementRef, handler: (event: PointerEvent) => void) => {
  const elementRef = computed(() => unrefElement(target));
  const isMouseDown = ref(false);
  const isDrag = ref(false);

  const mouseDownListener = () => {
    isMouseDown.value = true;
  };
  const mouseUpListener = (event: PointerEvent) => {
    isMouseDown.value = false;
    if (isDrag.value) isDrag.value = false;
    else handler(event);
  };
  const mouseMoveListener = () => {
    if (!isMouseDown.value) return;
    isDrag.value = true;
  };

  const unsubscribes = [
    useEventListener(elementRef, "mousedown", mouseDownListener),
    useEventListener(elementRef, "mouseup", mouseUpListener),
    useEventListener(elementRef, "mousemove", mouseMoveListener),
  ];

  const stop = () => {
    for (const unsubscribe of unsubscribes) unsubscribe();
  };

  return stop;
};
