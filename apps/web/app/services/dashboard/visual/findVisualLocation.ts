import type { Visual } from "#shared/models/dashboard/data/Visual";

import { findVisualList } from "#shared/services/dashboard/findVisualList";

// The visual with the id and the group holding its list, which is none for a visual on the dashboard's own list. The
// List is found once and the visual is read from it, so a caller that writes to the visual's list needs no second search
export const findVisualLocation = (visuals: Visual[], id: Visual["id"]) => {
  const list = findVisualList(visuals, id);
  const visual = list?.visuals.find((listedVisual) => listedVisual.id === id);
  return list && visual ? { group: list.group, visual } : undefined;
};
