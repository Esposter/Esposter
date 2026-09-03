import type { MaybeElementRef } from "@vueuse/core";

import { MAX_ROTATION } from "@/services/visual/constants";

export const useRotatingTransform = (target: MaybeElementRef) => {
  const { elementHeight, elementWidth, elementX, elementY, isOutside } = useMouseInElement(target);
  const transform = computed(() => {
    // Handles x-axis
    const rotationX = (MAX_ROTATION / 2 - (elementY.value / elementHeight.value) * MAX_ROTATION).toFixed(2);
    // Handles y-axis
    const rotationY = ((elementX.value / elementWidth.value) * MAX_ROTATION - MAX_ROTATION / 2).toFixed(2);
    return isOutside.value
      ? ""
      : `perspective(${elementWidth.value}px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
  });
  return transform;
};
