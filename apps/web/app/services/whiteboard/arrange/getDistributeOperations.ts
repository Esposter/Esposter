import type { JsonPatchOperation } from "@esposter/shared";
import type { Bounds, Point, PositionedDocument } from "vue-block-editor-headless";

import { DistributeAxis } from "@/models/whiteboard/DistributeAxis";
import { WHITEBOARD_DISTRIBUTE_MINIMUM_BOXES } from "@/services/whiteboard/arrange/constants";
import { getSelectedBoxes } from "@/services/whiteboard/arrange/getSelectedBoxes";
import { takeOne } from "@esposter/shared";
import { movePositionedElement } from "vue-block-editor-headless";

// The start and the extent of a box along the axis its boxes are distributed on
const getStart = (bounds: Bounds, axis: DistributeAxis): number =>
  axis === DistributeAxis.Horizontal ? bounds.x : bounds.y;
const getExtent = (bounds: Bounds, axis: DistributeAxis): number =>
  axis === DistributeAxis.Horizontal ? bounds.width : bounds.height;
// The point a box sits at with its start moved to a value on the axis, its other coordinate kept
const getPointAt = (bounds: Bounds, axis: DistributeAxis, start: number): Point =>
  axis === DistributeAxis.Horizontal ? { x: start, y: bounds.y } : { x: bounds.x, y: start };

// The operations that space the boxes of a selection with equal gaps between neighbours, keeping the outermost two in place. The gap is what the
// Outermost two leave once the boxes' extents are taken out, so the gaps are equal however the boxes differ in size. A selection in which one box
// Spans the rest has no outer pair to keep, so it is given no operations
export const getDistributeOperations = (
  document: PositionedDocument,
  selectedIds: string[],
  axis: DistributeAxis,
): JsonPatchOperation[] => {
  const boxes = getSelectedBoxes(document, selectedIds);
  if (boxes.length < WHITEBOARD_DISTRIBUTE_MINIMUM_BOXES) return [];
  // A box that starts no later and ends no earlier than every other box is both outer edges, so there is no outer pair to keep and nothing is moved
  const hasSpanningBox = boxes.some(({ bounds }) =>
    boxes.every(
      ({ bounds: otherBounds }) =>
        getStart(bounds, axis) <= getStart(otherBounds, axis) &&
        getStart(bounds, axis) + getExtent(bounds, axis) >= getStart(otherBounds, axis) + getExtent(otherBounds, axis),
    ),
  );
  if (hasSpanningBox) return [];

  // The box that ends furthest along the axis is the last, even when it starts before another does, so a box lying inside another's span is never the
  // One that is taken for the outer edge
  const lastBox = boxes.reduce((furthest, box) =>
    getStart(box.bounds, axis) + getExtent(box.bounds, axis) >
    getStart(furthest.bounds, axis) + getExtent(furthest.bounds, axis)
      ? box
      : furthest,
  );
  const sortedBoxes = [
    ...boxes
      .filter(({ index }) => index !== lastBox.index)
      .toSorted((firstBox, secondBox) => getStart(firstBox.bounds, axis) - getStart(secondBox.bounds, axis)),
    lastBox,
  ];
  const firstStart = getStart(takeOne(sortedBoxes, 0).bounds, axis);
  const totalExtent = sortedBoxes.reduce((total, { bounds }) => total + getExtent(bounds, axis), 0);
  const gap =
    (getStart(lastBox.bounds, axis) + getExtent(lastBox.bounds, axis) - firstStart - totalExtent) /
    (sortedBoxes.length - 1);
  return sortedBoxes.flatMap(({ bounds, index }, position) => {
    // The first and the last hold still. Each box between them starts after the extents of the boxes before it, and one gap for each of those boxes
    if (position === 0 || position === sortedBoxes.length - 1) return [];

    const extentsBefore = sortedBoxes
      .slice(0, position)
      .reduce((total, { bounds: previousBounds }) => total + getExtent(previousBounds, axis), 0);
    const start = firstStart + extentsBefore + position * gap;
    return getStart(bounds, axis) === start
      ? []
      : movePositionedElement(document, index, getPointAt(bounds, axis, start));
  });
};
