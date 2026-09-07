export const usePollDialogStore = defineStore("message/input/pollDialog", () => {
  const isOpen = ref(false);
  return { isOpen };
});
