import type { DraftHandle } from "#src/models/shared/overlay/DraftHandle";
import type { TouchedKey } from "#src/models/shared/overlay/TouchedKey";

// One synchronous application of entries: the rows they wrote over held state, and the keys they touched
export interface OverlayDraft {
  handles: Set<DraftHandle>;
  touches: TouchedKey[];
}
