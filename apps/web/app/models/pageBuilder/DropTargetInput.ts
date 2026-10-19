import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

export interface DropTargetInput {
  document: WebpageDocument;
  draggedType: WebpageNodeType;
  getChildRect: (nodeId: string) => OverlayBox | undefined;
  hoveredNodeId?: string;
  pointer: { x: number; y: number };
}
