export const useConfirmBeforeNavigation = (isDirty: MaybeRefOrGetter<boolean>) => {
  onBeforeRouteLeave(
    () =>
      // oxlint-disable-next-line no-alert -- native confirm() is the intended navigation-guard prompt
      !toValue(isDirty) || window.confirm("Changes you made may not be saved."),
  );

  useEventListener("beforeunload", (event) => {
    if (!toValue(isDirty)) return;
    event.preventDefault();
  });
};
