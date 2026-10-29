import type { Drag } from "@/models/ui/dragReorder/Drag";
import type { Press } from "@/models/ui/dragReorder/Press";

// How far a row between the held row's old slot and its new one moves aside: toward the slot the held row leaves
export const getDragSiblingTranslate = (press: Press, drag: Drag, targetIndex: number, index: number) => {
  if (press.index < index && index <= targetIndex) return `0 ${-drag.shift / drag.scale}px`;
  else if (targetIndex <= index && index < press.index) return `0 ${drag.shift / drag.scale}px`;
  return "";
};
