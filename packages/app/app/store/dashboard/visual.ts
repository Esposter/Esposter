import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { createOperationData } from "@/services/shared/createOperationData";
import { createEditFormData } from "@/services/shared/editForm/createEditFormData";
import { useDashboardStore } from "@/store/dashboard";

export const useVisualStore = defineStore("dashboard/visual", () => {
  const dashboardStore = useDashboardStore();
  const { saveDashboard } = dashboardStore;
  const visualType = ref(VisualType.Area);
  const visuals = computed({
    get: () => dashboardStore.dashboard.visuals,
    set: (newVisuals) => {
      dashboardStore.dashboard.visuals = newVisuals;
    },
  });
  const {
    createVisual: storeCreateVisual,
    updateVisual,
    ...restOperationData
  } = createOperationData(visuals, ["id"], "Visual");
  const createVisual = () => {
    storeCreateVisual(
      new Visual({
        type: visualType.value,
        x: (visuals.value.length * 2) % noColumns.value,
        // Puts the item at the bottom
        y: visuals.value.length + noColumns.value,
      }),
    );
  };
  const noColumns = ref(12);
  const editFormData = createEditFormData(
    computed(() => visuals.value),
    ["id"],
  );
  const save = async (editedVisual: Visual) => {
    const { editFormDialog } = editFormData;
    updateVisual(editedVisual);
    await saveDashboard();
    editFormDialog.value = false;
  };
  return {
    createVisual,
    updateVisual,
    visuals,
    visualType,
    ...restOperationData,
    noColumns,
    ...editFormData,
    save,
  };
});
