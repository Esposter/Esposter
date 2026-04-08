export const useConfirmBeforeNavigation = (isDirty: Ref<boolean>) => {
  onBeforeRouteLeave(() => {
    if (isDirty.value && !window.confirm("Changes you made may not be saved.")) return false;
    else return true;
  });

  useEventListener("beforeunload", (event) => {
    if (!isDirty.value) return;
    event.preventDefault();
  });
};
