import { VisualType } from "@/models/dashboard/VisualType";
import { VisualTypeChartConfigurationMap } from "@/services/dashboard/chart/VisualTypeChartConfigurationMap";
import { createItemMetadata } from "@/services/shared/createItemMetadata";
import { useDashboardStore } from "@/store/dashboard";

export const useVisualStore = defineStore("dashboard/visual", () => {
  const dashboardStore = useDashboardStore();
  const { dashboard } = storeToRefs(dashboardStore);
  const visuals = computed({
    get: () => dashboard.value.visuals,
    set: (newVisuals) => {
      dashboard.value.visuals = newVisuals;
    },
  });
  const selectedVisualType = ref(VisualType.Area);
  const addVisual = () => {
    const id = crypto.randomUUID();
    visuals.value.push({
      id,
      type: selectedVisualType.value,
      configuration: VisualTypeChartConfigurationMap[selectedVisualType.value].getInitialConfiguration(),
      i: id,
      x: (visuals.value.length * 2) % noColumns.value,
      // Puts the item at the bottom
      y: visuals.value.length + noColumns.value,
      w: 4,
      h: 4,
      ...createItemMetadata(),
    });
  };
  const removeVisual = (id: string) => {
    const index = visuals.value.findIndex((visual) => visual.id === id);
    if (index === -1) return;
    visuals.value.splice(index, 1);
  };
  const noColumns = ref(12);
  return { visuals, selectedVisualType, addVisual, removeVisual, noColumns };
});
