import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import type { DropTarget } from "@/models/pageBuilder/DropTarget";
import type { FrameGeometry } from "@/models/pageBuilder/FrameGeometry";
import type { MaybeRefOrGetter } from "vue";

import { DRAG_THRESHOLD, WEBPAGE_NODE_TYPE_TITLE_MAP } from "@/services/pageBuilder/constants";
import { insertAt } from "@/services/pageBuilder/insertAt";
import { resolveDropTarget } from "@/services/pageBuilder/resolveDropTarget";
import { toFramePoint } from "@/services/pageBuilder/toFramePoint";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";

const checkIsInsideFrame = (point: { x: number; y: number }, frameRect: FrameGeometry["frameRect"]) =>
  point.x >= frameRect.left &&
  point.x <= frameRect.left + frameRect.width &&
  point.y >= frameRect.top &&
  point.y <= frameRect.top + frameRect.height;

// The slot a block of the type dropped at a viewport point lands in, or none when the point is outside the frame, or when
// The document is not held or no slot takes the type
const getDropTargetAt = (
  document: undefined | WebpageDocument,
  type: WebpageNodeType,
  point: { x: number; y: number },
  geometry: FrameGeometry | undefined,
): DropTarget | undefined => {
  if (!document || !geometry || !checkIsInsideFrame(point, geometry.frameRect)) return undefined;

  return resolveDropTarget({
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
export const usePageBuilderDrag = (resourceId: MaybeRefOrGetter<string>, announce: (message: string) => void) => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { getDocument } = pageBuilderDocumentStore;
  const dropTarget = shallowRef<DropTarget>();
  // Set once a drag passes the threshold, so the editor can let the pointer pass through the canvas frame, whose document would take it
  const isDragging = ref(false);

  const startPaletteDrag = (
    type: WebpageNodeType,
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

      dropTarget.value = getDropTargetAt(getDocument(toValue(resourceId)), type, point, getFrameGeometry());
    };
    const onPointerUp = () => {
      const wasDragging = isDragging.value;
      const landing = dropTarget.value;
      endDrag();
      if (!wasDragging || landing === undefined) return;

      if (insertAt(toValue(resourceId), landing.slotPointer, landing.index, type))
        announce(`Inserted ${WEBPAGE_NODE_TYPE_TITLE_MAP[type]}`);
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
