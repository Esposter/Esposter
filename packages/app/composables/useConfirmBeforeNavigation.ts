export const useConfirmBeforeNavigation = (isDirty: Ref<boolean>) => {
  onBeforeRouteLeave(() => {
    if (isDirty.value && !window.confirm("Changes you made may not be saved.")) return false;
  });

  useEventListener("beforeunload", (e) => {
    if (!isDirty.value) return;
    e.preventDefault();
    // Even though the docs tell us that it's deprecated,
    // this actually makes the window prompt for reloading pop up
    e.returnValue = false;
  });
};
