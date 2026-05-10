export const useKeyboardShortcutsDialogStore = defineStore("message/input/keyboardShortcutsDialog", () => {
  const isOpen = ref(false);
  return { isOpen };
});
