import type { DropIndicatorInput } from "@/models/pageBuilder/DropIndicatorInput";
import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

import { LINE_THICKNESS } from "@/services/pageBuilder/constants";
import { getGapPosition } from "@/services/pageBuilder/getGapPosition";

// The line in the gap a block lands in, across the slot's axis from the children's own extent
export const getLineBox = ({
  childBoxes,
  index,
  isHorizontal,
}: Pick<DropIndicatorInput, "childBoxes" | "index" | "isHorizontal">): OverlayBox | undefined => {
  const measured = childBoxes.filter((box) => box !== undefined);
  if (measured.length === 0) return undefined;

  const previous = childBoxes.slice(0, index).findLast((box) => box !== undefined);
  const next = childBoxes.slice(index).find((box) => box !== undefined);
  const left = Math.min(...measured.map((box) => box.left));
  const top = Math.min(...measured.map((box) => box.top));
  if (isHorizontal) {
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
