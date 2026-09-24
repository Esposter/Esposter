export const useLayoutStore = defineStore("layout", () => {
  const { mobile } = useVDisplay();
  const isDesktop = computed(() => !mobile.value);
  const isLeftDrawerOpen = ref(isDesktop.value);
  const isRightDrawerOpen = ref(isDesktop.value);
  // Resize-only refs, read-only to outer components: whether to show the drawer-toggle buttons
  // Depends solely on screen size, so the UI doesn't shift when a drawer opens or closes.
  const isLeftDrawerOpenAuto = ref(isDesktop.value);
  const isRightDrawerOpenAuto = ref(isDesktop.value);
  // While the page's footer — a message composer — has focus, the narrow screen's dock steps aside for the keyboard
  const isFooterFocused = ref(false);
  return {
    isDesktop,
    isFooterFocused,
    isLeftDrawerOpen,
    isLeftDrawerOpenAuto,
    isRightDrawerOpen,
    isRightDrawerOpenAuto,
  };
});
