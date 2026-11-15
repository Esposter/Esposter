import type { DropIndicatorKind } from "#src/models/pageBuilder/DropIndicatorKind";
import type { OverlayBox } from "#src/models/pageBuilder/OverlayBox";

export interface DropIndicator {
  box: OverlayBox;
  kind: DropIndicatorKind;
}
