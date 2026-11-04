import type { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { getVisualList } from "@/services/dashboard/visual/getVisualList";

// A removal assigns a new list to the group or the dashboard holding it, never splices it, so a holder of the old array
// Sees no change
export const removeVisualFromList = (dashboard: Dashboard, group: undefined | Visual, id: Visual["id"]) => {
  const newVisuals = getVisualList(dashboard, group).filter((visual) => visual.id !== id);
  if (group) group.visuals = newVisuals;
  else dashboard.visuals = newVisuals;
};
