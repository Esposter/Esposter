import type { Visual } from "#shared/models/dashboard/data/Visual";

import { MAX_VISUAL_GROUP_DEPTH } from "#shared/services/dashboard/constants";
import { getVisualDepth } from "#shared/services/dashboard/getVisualDepth";

// Whether a new group added to the list of a group would sit past the depth cap. The dashboard's own list is never past it
export const checkIsGroupTooDeep = (visuals: Visual[], targetGroupId: undefined | Visual["id"]) =>
  targetGroupId !== undefined && getVisualDepth(visuals, targetGroupId) + 1 > MAX_VISUAL_GROUP_DEPTH;
