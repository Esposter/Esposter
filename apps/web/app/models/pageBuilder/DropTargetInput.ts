import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

export interface DropTargetInput<TDocument, TType> {
  checkIsHorizontalOwner: (ownerId: string) => boolean;
  document: TDocument;
  draggedType: TType;
  getChildRect: (nodeId: string) => OverlayBox | undefined;
  hoveredNodeId?: string;
  pointer: { x: number; y: number };
}
