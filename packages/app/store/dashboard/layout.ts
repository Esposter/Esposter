import { DashboardVisualType } from "@/models/dashboard/DashboardVisualType";
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
  const selectedVisualType = ref(DashboardVisualType.Bar);
  const pushVisual = () => {
    visuals.value.push({
      type: selectedVisualType.value,
      x: (visuals.value.length * 2) % noColumns.value,
      // Puts the item at the bottom
      y: visuals.value.length + noColumns.value,
      w: 4,
      h: 4,
      i: crypto.randomUUID(),
    });
  };
  const removeVisual = (id: string) => {
    const index = visuals.value.findIndex(({ i }) => i === id);
    if (index === -1) return;
    visuals.value.splice(index, 1);
  };
  const noColumns = ref(12);
  return { visuals, selectedVisualType, pushVisual, removeVisual, noColumns };
});
