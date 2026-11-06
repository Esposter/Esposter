import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

// A slot of the survey canvas an element may drop into: the box its owner is drawn in, the boxes of its children in order,
// And the types the core's slot accepts, read from the core so the canvas and the core refuse the same kinds
export interface SurveyDropSlot {
  acceptedTypes: readonly string[];
  box: OverlayBox;
  childBoxes: OverlayBox[];
  slotPointer: string;
}
