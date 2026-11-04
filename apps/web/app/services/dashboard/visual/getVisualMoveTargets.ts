import type { Visual } from "#shared/models/dashboard/data/Visual";

import { listVisuals } from "#shared/services/dashboard/listVisuals";
import { checkIsMoveRefused } from "@/services/dashboard/visual/checkIsMoveRefused";
import { findVisualLocation } from "@/services/dashboard/visual/findVisualLocation";
import { getGroupTitle } from "@/services/dashboard/visual/getGroupTitle";

// The lists a visual can move to from the one it sits in, as radio options whose value is the group's id, and "" for the
// Dashboard's own list. A group is never offered for the visual's own list, and a group the move rule refuses is not offered.
// Groups that share a title take a numeric suffix from the second on, in tree order, so the options read apart
export const getVisualMoveTargets = (visuals: Visual[], id: Visual["id"]) => {
  const location = findVisualLocation(visuals, id);
  if (!location) return [];

  const titleCounts = new Map<string, number>();
  const groupTargets = listVisuals(visuals)
    .filter(
      (group) =>
        group.visuals !== undefined && group.id !== location.group?.id && !checkIsMoveRefused(visuals, id, group.id),
    )
    .map((group) => {
      const title = getGroupTitle(group);
      const titleCount = (titleCounts.get(title) ?? 0) + 1;
      titleCounts.set(title, titleCount);
      return { title: titleCount === 1 ? title : `${title} ${titleCount}`, value: group.id };
    });
  return location.group ? [{ title: "Dashboard", value: "" }, ...groupTargets] : groupTargets;
};
