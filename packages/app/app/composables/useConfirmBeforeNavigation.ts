export const useConfirmBeforeNavigation = (isDirty: Ref<boolean>) => {
  onBeforeRouteLeave(() => {
    if (isDirty.value && !window.confirm("Changes you made may not be saved.")) return false;
  });

  useEventListener("beforeunload", (event) => {
    if (!isDirty.value) return;
    event.preventDefault();
    // Even though the docs tell us that it's deprecated,
    // this actually works and displays the window prompt for reloading
    event.returnValue = false;
  });
};
