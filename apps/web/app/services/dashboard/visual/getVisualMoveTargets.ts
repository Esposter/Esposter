import type { Visual } from "#shared/models/dashboard/data/Visual";

import { listVisuals } from "#shared/services/dashboard/listVisuals";
import { checkIsMoveRefused } from "@/services/dashboard/visual/checkIsMoveRefused";
import { findVisualLocation } from "@/services/dashboard/visual/findVisualLocation";
import { getGroupTitle } from "@/services/dashboard/visual/getGroupTitle";

// The lists a visual can move to from its own list, as radio options whose value is the group's id, and "" for the
// Dashboard's own list.
// A group is never offered for the visual's own list, and a group the move rule refuses is not offered.
// Groups sharing a title take a numeric suffix from the second on, in tree order, so the options read apart
export const getVisualMoveTargets = (visuals: Visual[], id: Visual["id"]) => {
  const location = findVisualLocation(visuals, id);
  if (!location) return [];

  const groups = listVisuals(visuals).filter(
    (group) =>
      group.visuals !== undefined && group.id !== location.group?.id && !checkIsMoveRefused(visuals, id, group.id),
  );
  // Every group's own title is reserved before any suffix is chosen.
  // So a numbered label never equals a title another group holds
  const reservedTitles = new Set(groups.map((group) => getGroupTitle(group)));
  const takenLabels = new Set<string>();
  const groupTargets = groups.map((group) => {
    const title = getGroupTitle(group);
    let label = title;
    for (let number = 2; takenLabels.has(label) || (label !== title && reservedTitles.has(label)); number++)
      label = `${title} ${number}`;
    takenLabels.add(label);
    return { title: label, value: group.id };
  });
  return location.group ? [{ title: "Dashboard", value: "" }, ...groupTargets] : groupTargets;
};
