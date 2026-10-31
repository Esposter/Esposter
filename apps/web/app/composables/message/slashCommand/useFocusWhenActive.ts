// The chip row moves focus by index rather than by click, so an input that becomes the active one takes focus —
// Including the one that is already active when it mounts, which a plain watch would miss
export const useFocusWhenActive = (
  input: Readonly<ShallowRef<HTMLInputElement | null>>,
  isActive: MaybeRefOrGetter<boolean>,
) => {
  const { trigger } = watchTriggerable(
    () => toValue(isActive),
    (newIsActive) => {
      if (newIsActive) input.value?.focus();
    },
  );

  onMounted(() => {
    trigger();
  });
};
