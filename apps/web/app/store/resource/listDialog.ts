// Singleton dialog target for the /all list's row rename, from the context menu or the row's ⋮ menu
export const useListDialogStore = defineStore("resource/listDialog", () => {
  const renamingId = ref("");
  return { renamingId };
});
