import type { SnapGuide } from "@/models/whiteboard/SnapGuide";
import type { SnapResult } from "@/models/whiteboard/SnapResult";
import type { Bounds, PositionedDocument } from "vue-block-editor-headless";

import { SnapAxis } from "@/models/whiteboard/SnapAxis";
import { ALIGNMENT_TOLERANCE, SNAP_DISTANCE } from "@/services/whiteboard/gesture/constants";
import { checkIsResizablePositionedElement, getElementBounds } from "vue-block-editor-headless";

// The start and the size a box covers along one axis
const getAxisExtent = ({ height, width, x, y }: Bounds, axis: SnapAxis): { size: number; start: number } =>
  axis === SnapAxis.X ? { size: width, start: x } : { size: height, start: y };

// The lines a box aligns on along one axis: its start edge, its centre and its end edge. An edge midpoint lies on two of these lines, so it snaps
// The same way an edge or centre does
const getAxisLines = (bounds: Bounds, axis: SnapAxis): number[] => {
  const { size, start } = getAxisExtent(bounds, axis);
  return [start, start + size / 2, start + size];
};

// The offset that brings a line of the moved box onto the nearest line of another element, or undefined when no pair of lines is within the distance
const getAxisOffset = (movedLines: number[], targetLines: number[], distance: number): number | undefined => {
  const offsets = movedLines
    .flatMap((movedLine) => targetLines.map((targetLine) => targetLine - movedLine))
    .filter((offset) => Math.abs(offset) <= distance);
  if (offsets.length === 0) return undefined;

  return offsets.reduce((nearest, offset) => (Math.abs(offset) < Math.abs(nearest) ? offset : nearest));
};

// The offset a moved box snaps by along one axis, or zero when no line of another element is within the distance
const getSnapOffset = (axis: SnapAxis, proposedBounds: Bounds, targetBounds: Bounds[], distance: number): number =>
  getAxisOffset(
    getAxisLines(proposedBounds, axis),
    targetBounds.flatMap((bounds) => getAxisLines(bounds, axis)),
    distance,
  ) ?? 0;

// Whether a box has one of its lines on a position along an axis, within the alignment tolerance
const checkIsOnLine = (bounds: Bounds, axis: SnapAxis, position: number): boolean =>
  getAxisLines(bounds, axis).some((line) => Math.abs(line - position) <= ALIGNMENT_TOLERANCE);

// The guides of the alignments a snapped box holds along one axis. Each position where a line of the box lies on a line of another element gets one
// Guide, which runs along the other axis across the box and each element that lies on the same line
const getAxisGuides = (axis: SnapAxis, snappedBounds: Bounds, targetBounds: Bounds[]): SnapGuide[] => {
  const otherAxis = axis === SnapAxis.X ? SnapAxis.Y : SnapAxis.X;
  const alignedPositions = getAxisLines(snappedBounds, axis).filter((position) =>
    targetBounds.some((bounds) => checkIsOnLine(bounds, axis, position)),
  );
  return Array.from(new Set(alignedPositions), (position) => {
    const alignedBounds = [snappedBounds, ...targetBounds.filter((bounds) => checkIsOnLine(bounds, axis, position))];
    const extents = alignedBounds.map((bounds) => getAxisExtent(bounds, otherAxis));
    return {
      axis,
      end: Math.max(...extents.map(({ size, start }) => start + size)),
      position,
      start: Math.min(...extents.map(({ start }) => start)),
    };
  });
};

// The offset a moved box snaps by on each axis, to the nearest edge, centre or edge midpoint of the other elements within the snap distance, with the
// Guides of the alignments the snapped box then holds. The snap distance is held in screen pixels, so it is divided by the scale to take document
// Units. The moving elements are left out of the lines the box snaps to, and an axis with nothing in range takes no offset
export const getSnap = (
  document: PositionedDocument,
  movingIds: string[],
  proposedBounds: Bounds,
  scale: number,
): SnapResult => {
  const targetBounds = document.elements
    .filter((element) => !movingIds.includes(element.id) && checkIsResizablePositionedElement(element))
    .map((element) => getElementBounds(element));
  const distance = SNAP_DISTANCE / scale;
  const offset = {
    x: getSnapOffset(SnapAxis.X, proposedBounds, targetBounds, distance),
    y: getSnapOffset(SnapAxis.Y, proposedBounds, targetBounds, distance),
  };
  const snappedBounds = { ...proposedBounds, x: proposedBounds.x + offset.x, y: proposedBounds.y + offset.y };
  return {
    guides: [
      ...getAxisGuides(SnapAxis.X, snappedBounds, targetBounds),
      ...getAxisGuides(SnapAxis.Y, snappedBounds, targetBounds),
    ],
    offset,
  };
};
