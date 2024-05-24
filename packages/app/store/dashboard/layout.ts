import type { DashboardVisual } from "@/models/dashboard/DashboardVisual";
import { DashboardVisualType } from "@/models/dashboard/DashboardVisualType";

export const useLayoutStore = defineStore("dashboard/layout", () => {
  const layout = ref<DashboardVisual[]>([]);
  const selectedDashboardVisualType = ref(DashboardVisualType.Bar);
  const pushDashboardVisual = () => {
    layout.value.push({
      type: selectedDashboardVisualType.value,
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
  return { layout, selectedDashboardVisualType, pushDashboardVisual, removeDashboardVisual, noColumns };
});
