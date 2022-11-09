import { MaybeElement, MaybeElementRef } from "@vueuse/core";

export const useRotatingTransform = (target: MaybeElementRef<MaybeElement>) => {
  const { elementX, elementY, isOutside, elementHeight, elementWidth } = $(useMouseInElement(target));
  const transform = computed(() => {
    const MAX_ROTATION = 20;
    // Handles x-axis
    const rX = (MAX_ROTATION / 2 - (elementY / elementHeight) * MAX_ROTATION).toFixed(2);
    // Handles y-axis
    const rY = ((elementX / elementWidth) * MAX_ROTATION - MAX_ROTATION / 2).toFixed(2);
    return isOutside ? "" : `perspective(${elementWidth}px) rotateX(${rX}deg) rotateY(${rY}deg)`;
  });
  return transform;
};
