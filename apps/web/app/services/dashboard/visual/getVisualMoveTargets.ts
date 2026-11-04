import type { Visual } from "#shared/models/dashboard/data/Visual";

import { listVisuals } from "#shared/services/dashboard/listVisuals";
import { DASHBOARD_UNTITLED_GROUP_TITLE } from "@/services/dashboard/constants";
import { checkIsMoveRefused } from "@/services/dashboard/visual/checkIsMoveRefused";
import { findVisualLocation } from "@/services/dashboard/visual/findVisualLocation";

// The lists a visual can move to from the one it sits in, as radio options whose value is the group's id, and "" for the
// Dashboard's own list. A group is never offered for the visual's own list, and a group the move rule refuses is not offered
export const getVisualMoveTargets = (visuals: Visual[], id: Visual["id"]) => {
  const location = findVisualLocation(visuals, id);
  if (!location) return [];

  const groupTargets = listVisuals(visuals)
    .filter(
      (group) =>
        group.visuals !== undefined && group.id !== location.group?.id && !checkIsMoveRefused(visuals, id, group.id),
    )
    .map((group) => ({ title: group.chart.configuration.title || DASHBOARD_UNTITLED_GROUP_TITLE, value: group.id }));
  return location.group ? [{ title: "Dashboard", value: "" }, ...groupTargets] : groupTargets;
};
