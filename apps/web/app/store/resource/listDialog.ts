import type { ResourceInResource } from "@esposter/db-schema";

// Singleton dialog targets for the /all list: a row's rename, from the context menu or the row's ⋮ menu, and a delete
// Of one row or of the selection
export const useListDialogStore = defineStore("resource/listDialog", () => {
  const renamingId = ref("");
  const deletingIds = ref<ResourceInResource["id"][]>([]);
  return { deletingIds, renamingId };
});
