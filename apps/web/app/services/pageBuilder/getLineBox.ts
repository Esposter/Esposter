import type { DropIndicatorInput } from "@/models/pageBuilder/DropIndicatorInput";
import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

import { checkIsSameLine } from "@/services/pageBuilder/checkIsSameLine";
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
  if (isHorizontal) {
    // A row that wraps starts a line at the child the drop lands before, so the line stands at that child's edge
    const isNextOnNewLine = previous !== undefined && next !== undefined && !checkIsSameLine(previous, next);
    const lineBox = isNextOnNewLine || previous === undefined ? next : previous;
    const gapLeft = getGapPosition(
      isNextOnNewLine || previous === undefined ? undefined : previous.left + previous.width,
      next?.left,
    );
    if (gapLeft === undefined || lineBox === undefined) return undefined;

    const lineChildren = measured.filter((box) => checkIsSameLine(box, lineBox));
    const top = Math.min(...lineChildren.map((box) => box.top));
    const bottom = Math.max(...lineChildren.map((box) => box.top + box.height));
    return { height: bottom - top, left: gapLeft - LINE_THICKNESS / 2, top, width: LINE_THICKNESS };
  }

  const left = Math.min(...measured.map((box) => box.left));
  const gapTop = getGapPosition(previous ? previous.top + previous.height : undefined, next?.top);
  if (gapTop === undefined) return undefined;

  const right = Math.max(...measured.map((box) => box.left + box.width));
  return { height: LINE_THICKNESS, left, top: gapTop - LINE_THICKNESS / 2, width: right - left };
};
