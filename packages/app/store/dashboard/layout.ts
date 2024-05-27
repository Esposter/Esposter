import { VisualType } from "@/models/dashboard/VisualType";
import { GetVisualTypeChartConfigurationMap } from "@/services/dashboard/chart/GetVisualTypeChartConfigurationMap";
import { useDashboardStore } from "@/store/dashboard";

export const useLayoutStore = defineStore("dashboard/layout", () => {
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
    visuals.value.push({
      x: (visuals.value.length * 2) % noColumns.value,
      // Puts the item at the bottom
      y: visuals.value.length + noColumns.value,
      w: 4,
      h: 4,
      i: crypto.randomUUID(),
      type: selectedVisualType.value,
      configuration: GetVisualTypeChartConfigurationMap[selectedVisualType.value](),
    });
  };
  const removeVisual = (id: string) => {
    const index = visuals.value.findIndex(({ i }) => i === id);
    if (index === -1) return;
    visuals.value.splice(index, 1);
  };
  const noColumns = ref(12);
  return { visuals, selectedVisualType, addVisual, removeVisual, noColumns };
});
