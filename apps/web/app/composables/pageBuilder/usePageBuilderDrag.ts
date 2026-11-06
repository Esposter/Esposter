import type { DropTarget } from "@/models/pageBuilder/DropTarget";
import type { FrameGeometry } from "@/models/pageBuilder/FrameGeometry";
import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { UiCommand } from "@/models/ui/UiCommand";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { checkIsInsideBox } from "@/services/pageBuilder/checkIsInsideBox";
import { PAGE_BUILDER_COMMAND_GROUP } from "@/services/pageBuilder/constants";
import { createUnshiftedChildRect } from "@/services/pageBuilder/createUnshiftedChildRect";
import { getDropRefusal } from "@/services/pageBuilder/getDropRefusal";
import { getEdgeScrollVelocity } from "@/services/pageBuilder/getEdgeScrollVelocity";
import { getSlotChildIds } from "@/services/pageBuilder/getSlotChildIds";
import { getSlotOwnerId } from "@/services/pageBuilder/getSlotOwnerId";
import { getPressMoveOutcome } from "@/services/pageBuilder/getPressMoveOutcome";
import { insertAt } from "@/services/pageBuilder/insertAt";
import { insertMergeFieldAt } from "@/services/pageBuilder/insertMergeFieldAt";
import { resolveDropTarget } from "@/services/pageBuilder/resolveDropTarget";
import { toFramePoint } from "@/services/pageBuilder/toFramePoint";
import { DRAG_PREVIEW_NODE_ID } from "@/services/pageBuilder/withDragPreview";
import { DRAG_START_DISTANCE, TOUCH_DRAG_DELAY_MS } from "@/services/ui/constants";
import { holdPageStillWhile } from "@/services/ui/holdPageStillWhile";
import { swallowNextWindowClick } from "@/services/ui/swallowNextWindowClick";
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
  // Where the canvas is drawing the dragged block now, whose push on the children after it the hit test reads past
  previewTarget?: DropTarget,
): DropTarget | undefined => {
  if (!document || !geometry || !checkIsInsideBox(point, geometry.frameRect)) return undefined;

  const pointer = toFramePoint(point, geometry.frameRect, geometry.scale);
  const getChildRect =
    previewTarget === undefined
      ? geometry.getChildRect
      : createUnshiftedChildRect({
          getChildRect: geometry.getChildRect,
          isHorizontal: geometry.checkIsHorizontalOwner(getSlotOwnerId(kind, document, previewTarget.slotPointer)),
          previewId: DRAG_PREVIEW_NODE_ID,
          trailingChildIds: getSlotChildIds(kind, document, previewTarget.slotPointer).slice(previewTarget.index),
        });
  return resolveDropTarget(kind, {
    checkIsHorizontalOwner: geometry.checkIsHorizontalOwner,
    document,
    draggedType: type,
    getChildRect,
    hoveredNodeId: geometry.getNodeIdAt(pointer),
    pointer,
  });
};

// A palette block or a merge field dragged to the point under the pointer. The drop indicator's target is held here for the
// Canvas to draw, and a release with a target inserts the block there, announced once. A merge field released over a text
// Is appended to that text. A press that never moves past the threshold is a click that the palette's own button handles,
// So the drag does nothing; Escape, a cancel or a release with no target inserts nothing. A finger's drag starts once it has
// Rested, and a finger that moves first is scrolling. The frame scrolls while the pointer is at its edge
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
  // The palette block type being dragged, which a merge field's drag leaves undefined, so only a block gets a ghost
  const draggedType = shallowRef<TNode["type"]>();
  // The viewport point the pointer is at while a drag is held, where the ghost is drawn
  const dragPoint = shallowRef<{ x: number; y: number }>();
  // Why a block is refused while the pointer is over the frame and no slot takes it, and empty otherwise
  const refusal = shallowRef("");
  // Set once a drag passes the threshold, so the editor can let the pointer pass through the canvas frame, whose document would take it
  const isDragging = ref(false);
  // Escape cancels the drag in progress, so it is bound only while there is one, and listed in the shortcuts dialog only then
  const cancelDrag = shallowRef<() => void>();
  // The edge scroll of the drag in progress, which the loop runs each animation frame while the drag is held
  let scrollDragEdge: ((delta: number) => void) | undefined;
  const { pause: pauseEdgeScroll, resume: resumeEdgeScroll } = useRafFn(
    ({ delta }) => {
      scrollDragEdge?.(delta);
    },
    { immediate: false },
  );
  useCommands((): UiCommand[] => {
    const cancel = cancelDrag.value;
    if (!cancel) return [];

    return [
      {
        group: PAGE_BUILDER_COMMAND_GROUP,
        id: "page-builder-cancel-drag",
        meaning: UiIconMeaning.Close,
        run: cancel,
        shortcut: "escape",
        title: "Cancel the drag",
      },
    ];
  });
  // Tracks a press until its release, a cancel or Escape. Each move of the drag reaches onMove, and the release reaches
  // `onRelease` with its point only while the press was dragging
  const trackDrag = (
    event: PointerEvent,
    getFrameGeometry: () => FrameGeometry | undefined,
    onMove: (point: { x: number; y: number }) => void,
    onRelease: (point: { x: number; y: number }) => void,
  ) => {
    const abortController = new AbortController();
    const { clientX: startX, clientY: startY, pointerType } = event;
    // Where the pointer was last, which a finger's drag that starts on its rest is drawn at
    let latestPoint = { x: startX, y: startY };
    // Whether the pointer has moved past the threshold, since a finger that rested and lifted without moving is a click
    let hasMoved = false;
    let restTimer: ReturnType<typeof setTimeout> | undefined;
    const endDrag = () => {
      abortController.abort();
      clearTimeout(restTimer);
      pauseEdgeScroll();
      scrollDragEdge = undefined;
      cancelDrag.value = undefined;
      dropTarget.value = undefined;
      refusal.value = "";
      draggedType.value = undefined;
      dragPoint.value = undefined;
      isDragging.value = false;
    };
    const moveTo = (point: { x: number; y: number }) => {
      dragPoint.value = point;
      onMove(point);
    };
    // Scrolls the frame toward the edge the pointer is near, then resolves the drop again, as the content moved under it
    const scrollToEdge = (delta: number) => {
      const geometry = getFrameGeometry();
      if (!geometry?.scrollBy) return;

      const velocity = getEdgeScrollVelocity(latestPoint.y, geometry.frameRect);
      if (velocity === 0) return;

      // A frame pixel is `scale` to a viewport pixel, and a step is at least a pixel, which a browser would round away
      geometry.scrollBy(Math.sign(velocity) * Math.max((Math.abs(velocity) * delta) / geometry.scale, 1));
      moveTo(latestPoint);
    };
    const startDragging = () => {
      isDragging.value = true;
      scrollDragEdge = scrollToEdge;
      resumeEdgeScroll();
      moveTo(latestPoint);
    };
    const onPointerMove = (moveEvent: PointerEvent) => {
      latestPoint = { x: moveEvent.clientX, y: moveEvent.clientY };
      const distance = Math.hypot(latestPoint.x - startX, latestPoint.y - startY);
      if (distance >= DRAG_START_DISTANCE) hasMoved = true;
      if (isDragging.value) {
        moveTo(latestPoint);
        return;
      }

      const outcome = getPressMoveOutcome(pointerType, distance);
      if (outcome === "start") startDragging();
      else if (outcome === "cancel") endDrag();
    };
    const onPointerUp = (upEvent: PointerEvent) => {
      if (isDragging.value) {
        onRelease({ x: upEvent.clientX, y: upEvent.clientY });
        if (hasMoved) swallowNextWindowClick();
      }
      endDrag();
    };
    const { signal } = abortController;
    cancelDrag.value = endDrag;
    window.addEventListener("pointermove", onPointerMove, { signal });
    window.addEventListener("pointerup", onPointerUp, { signal });
    window.addEventListener("pointercancel", endDrag, { signal });
    if (pointerType === "touch") {
      restTimer = setTimeout(startDragging, TOUCH_DRAG_DELAY_MS);
      holdPageStillWhile(() => isDragging.value, signal);
    }
  };
  // Resolves a block at the pointer, and where no slot takes it over the frame, says why it is refused
  const moveBlock = (type: TNode["type"], point: { x: number; y: number }, geometry: FrameGeometry | undefined) => {
    const target = getDropTargetAt(kind, getDocument(), type, point, geometry, dropTarget.value);
    dropTarget.value = target;
    refusal.value =
      target === undefined && checkIsInsideBox(point, geometry?.frameRect) ? getDropRefusal(kind.titles[type]) : "";
  };

  const startPaletteDrag = (
    type: TNode["type"],
    event: PointerEvent,
    getFrameGeometry: () => FrameGeometry | undefined,
  ) => {
    trackDrag(
      event,
      getFrameGeometry,
      (point) => {
        draggedType.value = type;
        moveBlock(type, point, getFrameGeometry());
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
    trackDrag(event, getFrameGeometry, noop, (point) => {
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

  return { dragPoint, draggedType, dropTarget, isDragging, refusal, startMergeFieldDrag, startPaletteDrag };
};
