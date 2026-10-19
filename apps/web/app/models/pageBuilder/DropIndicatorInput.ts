import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

export interface DropIndicatorInput {
  childBoxes: readonly (OverlayBox | undefined)[];
  index: number;
  ownerBox?: OverlayBox;
}
