import type { Visual } from "@/models/dashboard/Visual";
import { VisualType } from "@/models/dashboard/VisualType";
import { VisualTypeChartDataMap } from "@/services/dashboard/chart/VisualTypeChartDataMap";
import { createItemMetadata } from "@/services/shared/createItemMetadata";
import { createEditFormData } from "@/services/shared/editForm/createEditFormData";
import { createOperationData } from "@/services/shared/pagination/createOperationData";
import { useDashboardStore } from "@/store/dashboard";

export const useVisualStore = defineStore("dashboard/visual", () => {
  const dashboardStore = useDashboardStore();
  const { saveDashboard } = dashboardStore;
  const { dashboard } = storeToRefs(dashboardStore);
  const visuals = computed({
    get: () => dashboard.value.visuals,
    set: (newVisuals) => {
      dashboard.value.visuals = newVisuals;
    },
  });
  const selectedVisualType = ref(VisualType.Area);
  const {
    createVisual: storeCreateVisual,
    updateVisual,
    ...restOperationData
  } = createOperationData(visuals, "Visual");
  const createVisual = () => {
    const id = crypto.randomUUID();
    storeCreateVisual({
      id,
      type: selectedVisualType.value,
      configuration: VisualTypeChartDataMap[selectedVisualType.value].getInitialConfiguration(),
      i: id,
      x: (visuals.value.length * 2) % noColumns.value,
      // Puts the item at the bottom
      y: visuals.value.length + noColumns.value,
      w: 4,
      h: 4,
      ...createItemMetadata(),
    });
  };
  const noColumns = ref(12);
  const editFormData = createEditFormData(computed(() => visuals.value));
  const save = async (editedVisual: Visual) => {
    const { editFormDialog } = editFormData;
    updateVisual(editedVisual);
    await saveDashboard();
    editFormDialog.value = false;
  };
  return {
    visuals,
    selectedVisualType,
    createVisual,
    updateVisual,
    ...restOperationData,
    noColumns,
    ...editFormData,
    save,
  };
});
