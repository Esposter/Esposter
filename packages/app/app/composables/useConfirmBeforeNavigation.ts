export const useConfirmBeforeNavigation = (isDirty: Ref<boolean>) => {
  onBeforeRouteLeave(() => {
    if (isDirty.value && !window.confirm("Changes you made may not be saved.")) return false;
  });

  useEventListener("beforeunload", (event) => {
    if (!isDirty.value) return;
    event.preventDefault();
  });
};
