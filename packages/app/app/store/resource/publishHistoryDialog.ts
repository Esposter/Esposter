// Singleton dialog target for the Publish history blade's restore confirm — the version (as a string) being restored
export const usePublishHistoryDialogStore = defineStore("resource/publishHistoryDialog", () => {
  const restoringVersion = ref("");
  return { restoringVersion };
});
