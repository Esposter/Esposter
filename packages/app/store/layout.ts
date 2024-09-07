export const useLayoutStore = defineStore("layout", () => {
  const { mobile } = useDisplay();
  const leftDrawerOpen = ref(!mobile.value);
  const rightDrawerOpen = ref(!mobile.value);
  // These variables are only affected by screen resizing
  // They will be read-only to outer components deeper in the layout
  // because we want the decision of showing the outer components (i.e. buttons that open the drawers)
  // to only be dependent on screen-resizing for better UI/UX and not disappear and shift the UI
  // suddenly whenever we open and close the drawer
  const leftDrawerOpenAuto = ref(!mobile.value);
  const rightDrawerOpenAuto = ref(!mobile.value);
  return {
    leftDrawerOpen,
    leftDrawerOpenAuto,
    rightDrawerOpen,
    rightDrawerOpenAuto,
  };
});
