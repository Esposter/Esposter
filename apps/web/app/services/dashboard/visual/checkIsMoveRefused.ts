import type { Visual } from "#shared/models/dashboard/data/Visual";

import { listVisuals } from "#shared/services/dashboard/listVisuals";
import { checkIsMoveTooDeep } from "@/services/dashboard/visual/checkIsMoveTooDeep";
import { findVisual } from "@/services/dashboard/visual/findVisual";

// Whether a visual, with the visuals it holds, cannot move into a group, or onto the dashboard when there is no group: into
// Itself or a group it holds, into a visual that is not a group, or past the depth cap. The store refuses such a move, the
// Menu offers no such group and a grid refuses the drop before it lands, so all three read this one rule. A visual the tree
// Does not hold is not refused, since there is nothing to move
export const checkIsMoveRefused = (visuals: Visual[], id: Visual["id"], targetGroupId: undefined | Visual["id"]) => {
  const visual = findVisual(visuals, { id });
  if (!visual) return false;
  if (targetGroupId !== undefined && !findVisual(visuals, { id: targetGroupId })?.visuals) return true;
  if (listVisuals([visual]).some((movedVisual) => movedVisual.id === targetGroupId)) return true;

  return checkIsMoveTooDeep(visuals, id, targetGroupId);
};
