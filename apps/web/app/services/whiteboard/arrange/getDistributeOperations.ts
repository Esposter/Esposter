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
// Outermost two leave once the boxes' extents are taken out, so the gaps are equal however the boxes differ in size
export const getDistributeOperations = (
  document: PositionedDocument,
  selectedIds: string[],
  axis: DistributeAxis,
): JsonPatchOperation[] => {
  const boxes = getSelectedBoxes(document, selectedIds);
  if (boxes.length < WHITEBOARD_DISTRIBUTE_MINIMUM_BOXES) return [];

  const sortedBoxes = boxes.toSorted((first, second) => getStart(first.bounds, axis) - getStart(second.bounds, axis));
  const firstStart = getStart(takeOne(sortedBoxes, 0).bounds, axis);
  const lastBox = takeOne(sortedBoxes, sortedBoxes.length - 1);
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
