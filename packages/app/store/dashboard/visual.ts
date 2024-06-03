import { Chart } from "@/models/dashboard/chart/Chart";
import type { Visual } from "@/models/dashboard/Visual";
import { VisualType } from "@/models/dashboard/VisualType";
import { createItemMetadata } from "@/services/shared/createItemMetadata";
import { createEditFormData } from "@/services/shared/editForm/createEditFormData";
import { createOperationData } from "@/services/shared/pagination/createOperationData";
import { useDashboardStore } from "@/store/dashboard";

export const useVisualStore = defineStore("dashboard/visual", () => {
  const dashboardStore = useDashboardStore();
  const { saveDashboard } = dashboardStore;
  const { dashboard } = storeToRefs(dashboardStore);
  const visualType = ref(VisualType.Area);
  const {
    visualList,
    createVisual: storeCreateVisual,
    updateVisual,
    ...restOperationData
  } = createOperationData(
    computed({
      get: () => dashboard.value.visuals,
      set: (newVisuals) => {
        dashboard.value.visuals = newVisuals;
      },
    }),
    "Visual",
  );
  const createVisual = () => {
    const id = crypto.randomUUID();
    storeCreateVisual({
      id,
      type: visualType.value,
      chart: new Chart(),
      i: id,
      x: (visualList.value.length * 2) % noColumns.value,
      // Puts the item at the bottom
      y: visualList.value.length + noColumns.value,
      w: 4,
      h: 4,
      ...createItemMetadata(),
    });
  };
  const noColumns = ref(12);
  const editFormData = createEditFormData(computed(() => visualList.value));
  const save = async (editedVisual: Visual) => {
    const { editFormDialog } = editFormData;
    updateVisual(editedVisual);
    await saveDashboard();
    editFormDialog.value = false;
  };
  return {
    visualList,
    visualType,
    createVisual,
    updateVisual,
    ...restOperationData,
    noColumns,
    ...editFormData,
    save,
  };
});
