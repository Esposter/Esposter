import type { Visual } from "#shared/models/dashboard/data/Visual";

import { findVisualList } from "#shared/services/dashboard/findVisualList";
import { listVisuals } from "#shared/services/dashboard/listVisuals";
import { DASHBOARD_UNTITLED_GROUP_TITLE } from "@/services/dashboard/constants";
import { checkIsMoveRefused } from "@/services/dashboard/visual/checkIsMoveRefused";
import { findVisual } from "@/services/dashboard/visual/findVisual";

// The lists a visual can move to from the one it sits in, as radio options whose value is the group's id, and "" for the
// Dashboard's own list. A group is never offered for the visual's own list, and a group the move rule refuses is not offered
export const getVisualMoveTargets = (visuals: Visual[], id: Visual["id"]) => {
  const visual = findVisual(visuals, { id });
  const list = findVisualList(visuals, id);
  if (!visual || !list) return [];

  const groupTargets = listVisuals(visuals)
    .filter(
      (group) =>
        group.visuals !== undefined && group.id !== list.group?.id && !checkIsMoveRefused(visuals, id, group.id),
    )
    .map((group) => ({ title: group.chart.configuration.title || DASHBOARD_UNTITLED_GROUP_TITLE, value: group.id }));
  return list.group ? [{ title: "Dashboard", value: "" }, ...groupTargets] : groupTargets;
};
