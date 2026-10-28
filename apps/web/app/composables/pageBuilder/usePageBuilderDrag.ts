import type { DropTarget } from "@/models/pageBuilder/DropTarget";
import type { FrameGeometry } from "@/models/pageBuilder/FrameGeometry";
import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";
import type { MaybeRefOrGetter } from "vue";

import { checkIsInsideBox } from "@/services/pageBuilder/checkIsInsideBox";
import { DRAG_THRESHOLD } from "@/services/pageBuilder/constants";
import { insertAt } from "@/services/pageBuilder/insertAt";
import { insertMergeFieldAt } from "@/services/pageBuilder/insertMergeFieldAt";
import { resolveDropTarget } from "@/services/pageBuilder/resolveDropTarget";
import { toFramePoint } from "@/services/pageBuilder/toFramePoint";
import { noop } from "@esposter/shared";

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
  if (!document || !geometry || !checkIsInsideBox(point, geometry.frameRect)) return undefined;

  return resolveDropTarget(kind, {
    checkIsHorizontalOwner: geometry.checkIsHorizontalOwner,
    document,
    draggedType: type,
    getChildRect: geometry.getChildRect,
    hoveredNodeId: geometry.hoveredNodeId,
    pointer: toFramePoint(point, geometry.frameRect, geometry.scale),
  });
};

const stopClick = (clickEvent: MouseEvent) => {
  clickEvent.stopPropagation();
};

// A release can land on the control the press started on, and the browser clicks that control. The click that follows a
// Drag is stopped before it reaches the control, and the stop is dropped once the release's click has been dispatched
const swallowNextClick = () => {
  window.addEventListener("click", stopClick, { capture: true, once: true });
  setTimeout(() => {
    window.removeEventListener("click", stopClick, { capture: true });
  }, 0);
};

// A palette block or a merge field dragged to the point under the pointer. The drop indicator's target is held here for the
// Canvas to draw, and a release with a target inserts the block there, announced once. A merge field released over a text
// Is appended to that text. A press that never moves past the threshold is a click that the palette's own button handles,
// So the drag does nothing; Escape, a cancel or a release with no target inserts nothing
// The kind's signature, which each composable lists as its own inputs, so the duplicate-code gate skips it
// `jscpd:ignore-start`
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
  // `jscpd:ignore-end`
  const dropTarget = shallowRef<DropTarget>();
  // Set once a drag passes the threshold, so the editor can let the pointer pass through the canvas frame, whose document would take it
  const isDragging = ref(false);

  // Tracks a press until its release, a cancel or Escape. Each move past the threshold reaches onMove, and the release reaches
  // `onRelease` with its point only while the press was dragging
  const trackDrag = (
    event: PointerEvent,
    onMove: (point: { x: number; y: number }) => void,
    onRelease: (point: { x: number; y: number }) => void,
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
      if (isDragging.value) onMove(point);
    };
    const onPointerUp = (upEvent: PointerEvent) => {
      if (isDragging.value) {
        onRelease({ x: upEvent.clientX, y: upEvent.clientY });
        swallowNextClick();
      }
      endDrag();
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

  const startPaletteDrag = (
    type: TNode["type"],
    event: PointerEvent,
    getFrameGeometry: () => FrameGeometry | undefined,
  ) => {
    trackDrag(
      event,
      (point) => {
        dropTarget.value = getDropTargetAt(kind, getDocument(), type, point, getFrameGeometry());
      },
      () => {
        const landing = dropTarget.value;
        const document = getDocument();
        if (landing === undefined || !document) return;

        const title = kind.titles[type];
        if (
          insertAt(kind, document, toValue(resourceId), landing.slotPointer, landing.index, (id) =>
            kind.createNode(type, id),
          ) &&
          title
        )
          announce(`Inserted ${title}`);
      },
    );
  };

  // A merge field released over a text is appended to it, and the release over no text, or outside the frame, appends nothing
  const startMergeFieldDrag = (
    columnName: string,
    event: PointerEvent,
    getFrameGeometry: () => FrameGeometry | undefined,
  ) => {
    trackDrag(event, noop, (point) => {
      const geometry = getFrameGeometry();
      const document = getDocument();
      if (!geometry || !document || !checkIsInsideBox(point, geometry.frameRect)) return;

      const inserted = insertMergeFieldAt(
        kind,
        document,
        toValue(resourceId),
        toFramePoint(point, geometry.frameRect, geometry.scale),
        geometry.getChildRect,
        columnName,
      );
      if (inserted) announce(`Inserted merge field ${columnName}`);
    });
  };

  return { dropTarget, isDragging, startMergeFieldDrag, startPaletteDrag };
};
