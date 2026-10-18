import type { GridItem } from "@/models/dashboard/GridItem";

import { DASHBOARD_GRID_PASS_RATIO } from "@/services/dashboard/constants";
import { checkIsColliding } from "@/services/dashboard/grid/checkIsColliding";

// The moved item takes its new cell, and every item it lands on is pushed below it, and the items those land on in
// Turn. One the moved item has passed over by more than a share of its own height is left where it is
export const moveItem = <T extends GridItem>(layout: T[], target: GridItem) => {
  const movedLayout = layout.map((item) => (item.id === target.id ? { ...item, ...target } : { ...item }));
  const pushedIds = new Set<GridItem["id"]>([target.id]);
  const pushBelow = (pusher: T) => {
    for (const item of movedLayout) {
      if (pushedIds.has(item.id) || !checkIsColliding(pusher, item)) continue;
      if (item.y < pusher.y && pusher.y - item.y > item.h * DASHBOARD_GRID_PASS_RATIO) continue;

      pushedIds.add(item.id);
      item.y = pusher.y + pusher.h;
      pushBelow(item);
    }
  };
  const movedItem = movedLayout.find((item) => item.id === target.id);
  if (movedItem) pushBelow(movedItem);
  return movedLayout;
};
