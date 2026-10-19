import type { OverlayBox } from "@/services/pageBuilder/getOverlayBox";

import { DropIndicatorKind } from "@/models/pageBuilder/DropIndicatorKind";
import { checkIsHorizontalSlot } from "@/services/pageBuilder/checkIsHorizontalSlot";

// The thickness of the line a drop indicator draws between two children
const LINE_THICKNESS = 2;

export interface DropIndicator {
  box: OverlayBox;
  kind: DropIndicatorKind;
}

export interface DropIndicatorInput {
  childBoxes: readonly (OverlayBox | undefined)[];
  index: number;
  ownerBox: OverlayBox | undefined;
}

// The middle of the gap between the edge before a child and the edge after it, or the one edge that exists at a slot's end
const getGapPosition = (previousEdge: number | undefined, nextEdge: number | undefined) =>
  previousEdge !== undefined && nextEdge !== undefined ? (previousEdge + nextEdge) / 2 : (previousEdge ?? nextEdge);

// The line in the gap a block lands in, across the slot's axis from the children's own extent
const getLineBox = ({
  childBoxes,
  index,
}: Pick<DropIndicatorInput, "childBoxes" | "index">): OverlayBox | undefined => {
  const measured = childBoxes.filter((box) => box !== undefined);
  if (measured.length === 0) return undefined;

  const previous = childBoxes[index - 1];
  const next = childBoxes[index];
  const left = Math.min(...measured.map((box) => box.left));
  const top = Math.min(...measured.map((box) => box.top));
  if (checkIsHorizontalSlot(childBoxes)) {
    const gapLeft = getGapPosition(previous ? previous.left + previous.width : undefined, next?.left);
    if (gapLeft === undefined) return undefined;

    const bottom = Math.max(...measured.map((box) => box.top + box.height));
    return { height: bottom - top, left: gapLeft - LINE_THICKNESS / 2, top, width: LINE_THICKNESS };
  }

  const gapTop = getGapPosition(previous ? previous.top + previous.height : undefined, next?.top);
  if (gapTop === undefined) return undefined;

  const right = Math.max(...measured.map((box) => box.left + box.width));
  return { height: LINE_THICKNESS, left, top: gapTop - LINE_THICKNESS / 2, width: right - left };
};

// The indicator of a drop: a line where the block lands among the children of its slot, or an outline of the slot's owner
// When the slot is empty. None when the boxes it would be drawn in are not measured
export const getDropIndicatorBox = ({ childBoxes, index, ownerBox }: DropIndicatorInput): DropIndicator | undefined => {
  if (childBoxes.length > 0) {
    const box = getLineBox({ childBoxes, index });
    return box === undefined ? undefined : { box, kind: DropIndicatorKind.Line };
  }

  return ownerBox === undefined ? undefined : { box: ownerBox, kind: DropIndicatorKind.Outline };
};
