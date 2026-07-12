export const useShortcutsOverlayStore = defineStore("resource/shortcutsOverlay", () => {
  const isOpen = ref(false);
  return { isOpen };
});
