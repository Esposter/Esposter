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
      return;
    }
    leftCapDisplayWidth.value = totalLeftCapDisplayWidth.value;
    if (newTotalDisplayWidth <= (totalLeftCapDisplayWidth.value ?? 0) + (totalMiddleDisplayWidth.value ?? 0)) {
      middleDisplayWidth.value = newTotalDisplayWidth - (leftCapDisplayWidth.value ?? 0);
      rightCapDisplayWidth.value = 0;
    } else {
      middleDisplayWidth.value = totalMiddleDisplayWidth.value;
      rightCapDisplayWidth.value =
        newTotalDisplayWidth - ((leftCapDisplayWidth.value ?? 0) + (middleDisplayWidth.value ?? 0));
    }
  };
  // Each cap's total is the width its image first reports, and it is kept from then on
  watchOnce(leftCapDisplayWidth, (newLeftCapDisplayWidth) => {
    totalLeftCapDisplayWidth.value = newLeftCapDisplayWidth;
  });
  watchOnce(rightCapDisplayWidth, (newRightCapDisplayWidth) => {
    totalRightCapDisplayWidth.value = newRightCapDisplayWidth;
  });
  // Once both caps have measured, the width they leave for the middle is final, so it is set and synced once. Syncing
  // Writes the caps again, which is why this is a one-shot rather than a watch that would re-run on its own writes
  const measuredCapsWidth = computed(() =>
    leftCapDisplayWidth.value === undefined || rightCapDisplayWidth.value === undefined
      ? undefined
      : leftCapDisplayWidth.value + rightCapDisplayWidth.value,
  );
  watchOnce(measuredCapsWidth, (newMeasuredCapsWidth) => {
    if (newMeasuredCapsWidth === undefined) return;

    totalMiddleDisplayWidth.value = toValue(totalDisplayWidth) - newMeasuredCapsWidth;
    syncDisplayWidths(displayWidth.value);
  });

  return { leftCapDisplayWidth, middleDisplayWidth, rightCapDisplayWidth, syncDisplayWidths };
};
