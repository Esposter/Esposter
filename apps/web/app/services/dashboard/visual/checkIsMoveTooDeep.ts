import type { Visual } from "#shared/models/dashboard/data/Visual";

import { MAX_VISUAL_GROUP_DEPTH } from "#shared/services/dashboard/constants";
import { getVisualDepth } from "#shared/services/dashboard/getVisualDepth";
import { listVisuals } from "#shared/services/dashboard/listVisuals";
import { findVisual } from "@/services/dashboard/visual/findVisual";

// Whether moving a visual, with the visuals it holds, into a group, or onto the dashboard when there is no group, would
// Nest any group it carries past the depth cap. The store refuses such a move, and the menu offers only the groups it allows
export const checkIsMoveTooDeep = (visuals: Visual[], id: Visual["id"], targetGroupId: undefined | Visual["id"]) => {
  const visual = findVisual(visuals, { id });
  if (!visual) return false;

  const depthChange =
    (targetGroupId === undefined ? 0 : getVisualDepth(visuals, targetGroupId) + 1) - getVisualDepth(visuals, id);
  return listVisuals([visual]).some(
    (movedVisual) =>
      movedVisual.visuals !== undefined &&
      getVisualDepth(visuals, movedVisual.id) + depthChange > MAX_VISUAL_GROUP_DEPTH,
  );
};
