export const useConfirmBeforeNavigation = (isDirty: MaybeRefOrGetter<boolean>) => {
  onBeforeRouteLeave(() => {
    if (toValue(isDirty) && !window.confirm("Changes you made may not be saved.")) return false;
    else return true;
  });

  useEventListener("beforeunload", (event) => {
    if (!toValue(isDirty)) return;
    event.preventDefault();
  });
};
