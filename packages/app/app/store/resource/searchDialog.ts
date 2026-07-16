export const useSearchDialogStore = defineStore("resource/searchDialog", () => {
  const isOpen = ref(false);
  return { isOpen };
});
