import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";
import type { BlockDocument } from "headless-block-editor";

export interface DropTargetInput {
  document: BlockDocument;
  draggedType: WebpageNodeType;
  getChildRect: (nodeId: string) => OverlayBox | undefined;
  hoveredNodeId?: string;
  pointer: { x: number; y: number };
}
