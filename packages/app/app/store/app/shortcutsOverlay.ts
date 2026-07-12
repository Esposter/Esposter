export const useShortcutsOverlayStore = defineStore("app/shortcutsOverlay", () => {
  const isOpen = ref(false);
  return { isOpen };
});
