import type { DropIndicator } from "#src/models/pageBuilder/DropIndicator";
import type { DropIndicatorInput } from "#src/models/pageBuilder/DropIndicatorInput";

import { DropIndicatorKind } from "#src/models/pageBuilder/DropIndicatorKind";
import { getLineBox } from "#src/services/pageBuilder/getLineBox";

// The indicator of a drop: a line where the block lands among the children of its slot, or an outline of the slot's owner
// When the slot is empty. None when the boxes it would be drawn in are not measured
export const getDropIndicatorBox = ({
  childBoxes,
  index,
  isHorizontal,
  ownerBox,
}: DropIndicatorInput): DropIndicator | undefined => {
  if (childBoxes.length > 0) {
    const box = getLineBox({ childBoxes, index, isHorizontal });
    return box === undefined ? undefined : { box, kind: DropIndicatorKind.Line };
  }

  return ownerBox === undefined ? undefined : { box: ownerBox, kind: DropIndicatorKind.Outline };
};
