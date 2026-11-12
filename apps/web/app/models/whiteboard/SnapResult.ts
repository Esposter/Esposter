import type { SnapGuide } from "@/models/whiteboard/SnapGuide";
import type { Point } from "vue-block-editor-headless";

// The offset a move snaps by, which is zero on an axis with nothing in range, and the guides of the alignments the snapped box holds
export interface SnapResult {
  guides: SnapGuide[];
  offset: Point;
}
