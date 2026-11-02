import type { Visual } from "#shared/models/dashboard/data/Visual";

export const useDashboardDialogStore = defineStore("dashboard/dialog", () => {
  const deletingVisualId = ref<Visual["id"]>("");
  return { deletingVisualId };
});
