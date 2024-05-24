import { ChartType } from "@/models/dashboard/ChartType";
import type { DashboardVisual } from "@/models/dashboard/DashboardVisual";

export const useLayoutStore = defineStore("dashboard/layout", () => {
  const layout = ref<DashboardVisual[]>([]);
  const selectedChartType = ref(ChartType.Bar);
  const pushDashboardVisual = () => {
    layout.value.push({
      type: selectedChartType.value,
      x: (layout.value.length * 2) % noColumns.value,
      // Puts the item at the bottom
      y: layout.value.length + noColumns.value,
      w: 2,
      h: 2,
      i: crypto.randomUUID(),
    });
  };
  const removeDashboardVisual = (id: string) => {
    const index = layout.value.findIndex(({ i }) => i === id);
    if (index === -1) return;
    layout.value.splice(index, 1);
  };
  const noColumns = ref(12);
  return { layout, selectedChartType, pushDashboardVisual, removeDashboardVisual, noColumns };
});
