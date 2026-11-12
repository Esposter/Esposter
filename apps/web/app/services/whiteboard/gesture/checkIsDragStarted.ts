import type { Point } from "vue-block-editor-headless";

import { DRAG_START_DISTANCE } from "@/services/ui/constants";
import { getPointDistance } from "@/services/whiteboard/gesture/getPointDistance";

// Whether a press has travelled the drag start distance from where it went down, past which it is a drag and no longer a click
export const checkIsDragStarted = (downPoint: Point, point: Point): boolean =>
  getPointDistance(downPoint, point) >= DRAG_START_DISTANCE;
