export const useDisplayWidths = (totalDisplayWidth: MaybeRefOrGetter<number>, displayWidth: Ref<number>) => {
  const totalLeftCapDisplayWidth = ref<number>();
  const leftCapDisplayWidth = ref<number>();
  const totalMiddleDisplayWidth = ref<number>();
  const middleDisplayWidth = ref<number>();
  const totalRightCapDisplayWidth = ref<number>();
  const rightCapDisplayWidth = ref<number>();
  const syncDisplayWidths = (newTotalDisplayWidth: number) => {
    if (newTotalDisplayWidth <= (totalLeftCapDisplayWidth.value ?? 0)) {
      leftCapDisplayWidth.value = newTotalDisplayWidth;
      middleDisplayWidth.value = 0;
      rightCapDisplayWidth.value = 0;
    } else if (newTotalDisplayWidth <= (totalLeftCapDisplayWidth.value ?? 0) + (totalMiddleDisplayWidth.value ?? 0)) {
      leftCapDisplayWidth.value = totalLeftCapDisplayWidth.value;
      middleDisplayWidth.value = newTotalDisplayWidth - (leftCapDisplayWidth.value ?? 0);
      rightCapDisplayWidth.value = 0;
    } else {
      leftCapDisplayWidth.value = totalLeftCapDisplayWidth.value;
      middleDisplayWidth.value = totalMiddleDisplayWidth.value;
      rightCapDisplayWidth.value =
        newTotalDisplayWidth - ((leftCapDisplayWidth.value ?? 0) + (middleDisplayWidth.value ?? 0));
    }
  };

  watch(leftCapDisplayWidth, (newLeftCapDisplayWidth, oldLeftCapDisplayWidth) => {
    if (oldLeftCapDisplayWidth !== undefined || newLeftCapDisplayWidth === undefined) return;
    totalLeftCapDisplayWidth.value = newLeftCapDisplayWidth;
  });

  watch(
    [leftCapDisplayWidth, rightCapDisplayWidth],
    ([newLeftCapDisplayWidth, newRightCapDisplayWidth], [oldLeftCapDisplayWidth, oldRightCapDisplayWidth]) => {
      if (
        (oldLeftCapDisplayWidth !== undefined && oldRightCapDisplayWidth !== undefined) ||
        !(newLeftCapDisplayWidth !== undefined && newRightCapDisplayWidth !== undefined)
      )
        return;
      totalMiddleDisplayWidth.value = toValue(totalDisplayWidth) - (newLeftCapDisplayWidth + newRightCapDisplayWidth);
      // After all our display widths have been initialized, sync the proper values to the UI
      syncDisplayWidths(displayWidth.value);
    },
  );

  watch(rightCapDisplayWidth, (newRightCapDisplayWidth, oldRightCapDisplayWidth) => {
    if (oldRightCapDisplayWidth !== undefined || newRightCapDisplayWidth === undefined) return;
    totalRightCapDisplayWidth.value = newRightCapDisplayWidth;
  });

  return {
    leftCapDisplayWidth,
    middleDisplayWidth,
    rightCapDisplayWidth,
    syncDisplayWidths,
  };
};
