// Singleton dialog target for the Recycle bin's row actions (⋮ → delete forever)
export const useRecycleBinDialogStore = defineStore("resource/recycleBinDialog", () => {
  const purgingId = ref("");
  return { purgingId };
});
