import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { createEditFormData } from "@/services/shared/editForm/createEditFormData";
import { createOperationData } from "@/services/shared/pagination/createOperationData";
import { useDashboardStore } from "@/store/dashboard";

export const useVisualStore = defineStore("dashboard/visual", () => {
  const dashboardStore = useDashboardStore();
  const { saveDashboard } = dashboardStore;
  const visualType = ref(VisualType.Area);
  const {
    createVisual: storeCreateVisual,
    updateVisual,
    visualList,
    ...restOperationData
  } = createOperationData(
    computed({
      get: () => dashboardStore.dashboard.visuals,
      set: (newVisuals) => {
        dashboardStore.dashboard.visuals = newVisuals;
      },
    }),
    "Visual",
  );
  const createVisual = () => {
    storeCreateVisual(
      new Visual({
        type: visualType.value,
        x: (visualList.value.length * 2) % noColumns.value,
        // Puts the item at the bottom
        y: visualList.value.length + noColumns.value,
      }),
    );
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
    createVisual,
    updateVisual,
    visualList,
    visualType,
    ...restOperationData,
    noColumns,
    ...editFormData,
    save,
  };
});
