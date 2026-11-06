import type { DropTarget } from "@/models/pageBuilder/DropTarget";
import type { FrameGeometry } from "@/models/pageBuilder/FrameGeometry";
import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { UiCommand } from "@/models/ui/UiCommand";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "vue-block-editor-headless";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { checkIsInsideBox } from "@/services/pageBuilder/checkIsInsideBox";
import { PAGE_BUILDER_COMMAND_GROUP } from "@/services/pageBuilder/constants";
import { freezeFrameGeometry } from "@/services/pageBuilder/freezeFrameGeometry";
import { getDropRefusal } from "@/services/pageBuilder/getDropRefusal";
import { getEdgeScrollVelocity } from "@/services/pageBuilder/getEdgeScrollVelocity";
import { getNodeIdAt } from "@/services/pageBuilder/getNodeIdAt";
import { insertAt } from "@/services/pageBuilder/insertAt";
import { insertMergeFieldAt } from "@/services/pageBuilder/insertMergeFieldAt";
import { resolveDropTarget } from "@/services/pageBuilder/resolveDropTarget";
import { toFramePoint } from "@/services/pageBuilder/toFramePoint";
import { noop } from "@esposter/shared";
import { getBlockLayerRows } from "vue-block-editor-headless";

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

  const pointer = toFramePoint(point, geometry.frameRect, geometry.scale);
  return resolveDropTarget(kind, {
    checkIsHorizontalOwner: geometry.checkIsHorizontalOwner,
    document,
    draggedType: type,
    getChildRect: geometry.getChildRect,
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
  // The press's own state: whether it has passed the threshold, so the editor can let the pointer pass through the canvas frame,
  // Whose document would take it, and the viewport point the pointer is at, where the ghost is drawn
  const { cancel: cancelDrag, isDragging, point: dragPoint, startPress } = usePressDrag();
  // Why a block is refused while the pointer is over the frame and no slot takes it, and empty otherwise
  const refusal = shallowRef("");
  // The edge scroll of the drag in progress, which the loop runs each animation frame while the drag is held
  let scrollDragEdge: ((delta: number) => void) | undefined;
  const { pause: pauseEdgeScroll, resume: resumeEdgeScroll } = useRafFn(
    ({ delta }) => {
      scrollDragEdge?.(delta);
    },
    { immediate: false },
  );
  // Escape cancels the drag in progress, so it is listed in the shortcuts dialog only then
  useCommands((): UiCommand[] => {
    if (!isDragging.value) return [];

    return [
      {
        group: PAGE_BUILDER_COMMAND_GROUP,
        id: "page-builder-cancel-drag",
        meaning: UiIconMeaning.Close,
        run: cancelDrag,
        shortcut: "escape",
        title: "Cancel the drag",
      },
    ];
  });
  // Tracks a press until its release, a cancel or Escape, through the shared press tracker. Each move of the drag reaches
  // `onMove`, and the release reaches `onRelease` with its point only while the press was dragging
  const trackDrag = (
    event: PointerEvent,
    getFrameGeometry: () => FrameGeometry | undefined,
    onMove: (point: { x: number; y: number }) => void,
    onRelease: (point: { x: number; y: number }) => void,
  ) => {
    // Scrolls the frame toward the edge the pointer is near, then resolves the drop again, as the content moved under it
    const scrollToEdge = (delta: number) => {
      const geometry = getFrameGeometry();
      const point = dragPoint.value;
      if (!geometry?.scrollBy || !point) return;

      const velocity = getEdgeScrollVelocity(point.y, geometry.frameRect);
      if (velocity === 0) return;

      // A frame pixel is `scale` to a viewport pixel, and a step is at least a pixel, which a browser would round away
      geometry.scrollBy(Math.sign(velocity) * Math.max((Math.abs(velocity) * delta) / geometry.scale, 1));
      onMove(point);
    };
    startPress(event, {
      onEnd: () => {
        pauseEdgeScroll();
        scrollDragEdge = undefined;
        dropTarget.value = undefined;
        refusal.value = "";
        draggedType.value = undefined;
      },
      onMove,
      onRelease,
      onStart: () => {
        scrollDragEdge = scrollToEdge;
        resumeEdgeScroll();
      },
    });
  };
  // Resolves a block at the pointer, and where no slot takes it over the frame, says why it is refused
  const moveBlock = (type: TNode["type"], point: { x: number; y: number }, geometry: FrameGeometry | undefined) => {
    const target = getDropTargetAt(kind, getDocument(), type, point, geometry);
    dropTarget.value = target;
    refusal.value =
      target === undefined && checkIsInsideBox(point, geometry?.frameRect) ? getDropRefusal(kind.titles[type]) : "";
  };

  const startPaletteDrag = (
    type: TNode["type"],
    event: PointerEvent,
    getFrameGeometry: () => FrameGeometry | undefined,
  ) => {
    // The frame's boxes are read once, as the drag starts and before its preview is drawn, so the preview moves none of the
    // Boxes a later move resolves against
    let frozenGeometry: FrameGeometry | undefined;
    trackDrag(
      event,
      getFrameGeometry,
      (point) => {
        draggedType.value = type;
        const geometry = getFrameGeometry();
        const document = getDocument();
        if (geometry && document)
          frozenGeometry ??= freezeFrameGeometry(
            geometry,
            getBlockLayerRows(document, kind.children).map(({ nodePointer }) =>
              getNodeIdAt(kind, document, nodePointer),
            ),
          );
        moveBlock(type, point, frozenGeometry);
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
