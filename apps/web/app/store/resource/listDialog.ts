// Singleton dialog targets for the /all list's row actions (context menu → rename/delete)
export const useListDialogStore = defineStore("resource/listDialog", () => {
  const deletingId = ref("");
  const renamingId = ref("");
  return { deletingId, renamingId };
});
