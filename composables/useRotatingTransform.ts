import { MaybeElement, MaybeElementRef } from "@vueuse/core";

export const useRotatingTransform = (target: MaybeElementRef<MaybeElement>) => {
  const { elementX, elementY, isOutside, elementHeight, elementWidth } = useMouseInElement(target);
  const transform = computed(() => {
    const MAX_ROTATION = 20;
    const rX = (MAX_ROTATION / 2 - (elementY.value / elementHeight.value) * MAX_ROTATION).toFixed(2); // handles x-axis
    const rY = ((elementX.value / elementWidth.value) * MAX_ROTATION - MAX_ROTATION / 2).toFixed(2); // handles y-axis
    return isOutside.value ? "" : `perspective(${elementWidth.value}px) rotateX(${rX}deg) rotateY(${rY}deg)`;
  });
  return transform;
};
