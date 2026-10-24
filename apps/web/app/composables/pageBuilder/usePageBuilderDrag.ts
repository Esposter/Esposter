import type { DropTarget } from "@/models/pageBuilder/DropTarget";
import type { FrameGeometry } from "@/models/pageBuilder/FrameGeometry";
import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";
import type { MaybeRefOrGetter } from "vue";

import { DRAG_THRESHOLD } from "@/services/pageBuilder/constants";
import { insertAt } from "@/services/pageBuilder/insertAt";
import { resolveDropTarget } from "@/services/pageBuilder/resolveDropTarget";
import { toFramePoint } from "@/services/pageBuilder/toFramePoint";

const checkIsInsideFrame = (point: { x: number; y: number }, frameRect: FrameGeometry["frameRect"]) =>
  point.x >= frameRect.left &&
  point.x <= frameRect.left + frameRect.width &&
  point.y >= frameRect.top &&
  point.y <= frameRect.top + frameRect.height;

// The slot a block of the type dropped at a viewport point lands in, or none when the point is outside the frame, or when
// The document is not held or no slot takes the type
const getDropTargetAt = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  document: TDocument | undefined,
  type: TNode["type"],
  point: { x: number; y: number },
  geometry: FrameGeometry | undefined,
): DropTarget | undefined => {
  if (!document || !geometry || !checkIsInsideFrame(point, geometry.frameRect)) return undefined;

  return resolveDropTarget(kind, {
    checkIsHorizontalOwner: geometry.checkIsHorizontalOwner,
    document,
    draggedType: type,
    getChildRect: geometry.getChildRect,
    hoveredNodeId: geometry.hoveredNodeId,
    pointer: toFramePoint(point, geometry.frameRect, geometry.scale),
  });
};

// A palette block dragged into the slot under the pointer. The drop indicator's target is held here for the canvas to draw,
// And a release with a target inserts the block there, announced once. A press that never moves past the threshold is a click
// That the block's own button handles, so the drag does nothing; Escape, a cancel or a release with no target inserts nothing
// The kind's signature, which each composable lists as its own inputs, so the duplicate-code gate skips it
// jscpd:ignore-start
export const usePageBuilderDrag = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  getDocument: () => TDocument | undefined,
  resourceId: MaybeRefOrGetter<string>,
  announce: (message: string) => void,
) => {
  // jscpd:ignore-end
  const dropTarget = shallowRef<DropTarget>();
  // Set once a drag passes the threshold, so the editor can let the pointer pass through the canvas frame, whose document would take it
  const isDragging = ref(false);

  const startPaletteDrag = (
    type: TNode["type"],
    event: PointerEvent,
    getFrameGeometry: () => FrameGeometry | undefined,
  ) => {
    const abortController = new AbortController();
    const { clientX: startX, clientY: startY } = event;
    const endDrag = () => {
      abortController.abort();
      dropTarget.value = undefined;
      isDragging.value = false;
    };
    const onPointerMove = (moveEvent: PointerEvent) => {
      const point = { x: moveEvent.clientX, y: moveEvent.clientY };
      if (Math.hypot(point.x - startX, point.y - startY) >= DRAG_THRESHOLD) isDragging.value = true;
      if (!isDragging.value) return;

      dropTarget.value = getDropTargetAt(kind, getDocument(), type, point, getFrameGeometry());
    };
    const onPointerUp = () => {
      const wasDragging = isDragging.value;
      const landing = dropTarget.value;
      endDrag();
      const document = getDocument();
      if (!wasDragging || landing === undefined || !document) return;

      const title = kind.titles[type];
      if (insertAt(kind, document, toValue(resourceId), landing.slotPointer, landing.index, type) && title)
        announce(`Inserted ${title}`);
    };
    const onKeydown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === "Escape") endDrag();
    };
    const { signal } = abortController;
    window.addEventListener("pointermove", onPointerMove, { signal });
    window.addEventListener("pointerup", onPointerUp, { signal });
    window.addEventListener("pointercancel", endDrag, { signal });
    window.addEventListener("keydown", onKeydown, { signal });
  };

  return { dropTarget, isDragging, startPaletteDrag };
};
