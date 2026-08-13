export const useConfirmBeforeNavigation = (isDirty: MaybeRefOrGetter<boolean>) => {
  onBeforeRouteLeave(() => {
    // oxlint-disable-next-line no-alert -- native confirm() is the intended navigation-guard prompt
    if (toValue(isDirty) && !window.confirm("Changes you made may not be saved.")) return false;
    else return true;
  });

  useEventListener("beforeunload", (event) => {
    if (!toValue(isDirty)) return;
    event.preventDefault();
  });
};
