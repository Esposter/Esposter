export const useConfirmBeforeNavigation = (isDirty: Ref<boolean>) => {
  onBeforeRouteLeave(() => {
    if (isDirty.value && !window.confirm("Changes that you made may not be saved.")) return false;
  });

  useEventListener("beforeunload", ({ preventDefault }) => {
    if (!isDirty.value) return;
    preventDefault();
  });
};
