import type { DropIndicatorKind } from "@/models/pageBuilder/DropIndicatorKind";
import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

export interface DropIndicator {
  box: OverlayBox;
  kind: DropIndicatorKind;
}
