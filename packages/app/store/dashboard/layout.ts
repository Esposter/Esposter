import type { Layout, LayoutItem } from "grid-layout-plus";
import type { Except } from "type-fest";

const baseLayout: Except<LayoutItem, "i">[] = [
  { x: 0, y: 0, w: 2, h: 2 },
  { x: 2, y: 0, w: 2, h: 4 },
];

export const useLayoutStore = defineStore("layout", () => {
  const layout = ref<Layout>(baseLayout.map((l) => ({ ...l, i: crypto.randomUUID() })));
  const pushDashboardVisual = () => {
    layout.value.push({
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
  return { layout, pushDashboardVisual, removeDashboardVisual, noColumns };
});
