import type { OverlayBox } from "#src/models/pageBuilder/OverlayBox";

export interface DropTargetInput<TDocument, TType> {
  checkIsHorizontalOwner: (ownerId: string) => boolean;
  document: TDocument;
  // The node a handle is moving, which has no drop under the pointer while the pointer is over it or the nodes it holds
  draggedNodeId: string;
  draggedType: TType;
  getChildRect: (nodeId: string) => OverlayBox | undefined;
  hoveredNodeId?: string | undefined;
  pointer: { x: number; y: number };
}
