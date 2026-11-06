import type { DropTarget } from "@/models/pageBuilder/DropTarget";
import type { SurveyDropSlot } from "@/models/resource/survey/SurveyDropSlot";
import type { SurveyNodeType } from "vue-survey-engine-headless";

import { checkIsInsideBox } from "@/services/pageBuilder/checkIsInsideBox";
import { getDropIndex } from "@/services/pageBuilder/getDropIndex";

// The slot a kind dropped at a viewport point lands in: the nearest slot whose box holds the point and whose accepted types
// Take the kind, nearest being the smallest box, since a nested slot's box lies within its owner's. The index is the first
// Child whose midpoint the pointer has not crossed. Undefined when no slot holding the point takes the kind
export const resolveSurveyDropTarget = ({
  draggedType,
  point,
  slots,
}: {
  draggedType: SurveyNodeType;
  point: { x: number; y: number };
  slots: SurveyDropSlot[];
}): DropTarget | undefined => {
  const slot = slots
    .filter(({ acceptedTypes, box }) => checkIsInsideBox(point, box) && acceptedTypes.includes(draggedType))
    .toSorted((first, second) => first.box.width * first.box.height - second.box.width * second.box.height)[0];
  if (slot === undefined) return undefined;

  return { index: getDropIndex(slot.childBoxes, point, false), slotPointer: slot.slotPointer };
};
