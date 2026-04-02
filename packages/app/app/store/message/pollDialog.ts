export const usePollDialogStore = defineStore("message/pollDialog", () => {
  const isOpen = ref(false);
  return { isOpen };
});
