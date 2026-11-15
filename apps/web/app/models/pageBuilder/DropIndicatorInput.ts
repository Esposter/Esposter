import type { OverlayBox } from "#src/models/pageBuilder/OverlayBox";

export interface DropIndicatorInput {
  childBoxes: readonly (OverlayBox | undefined)[];
  index: number;
  isHorizontal: boolean;
  ownerBox?: OverlayBox;
}
