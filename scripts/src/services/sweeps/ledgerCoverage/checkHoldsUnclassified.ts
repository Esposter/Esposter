import type { KitOverlay } from "#src/models/shared/KitOverlay";

import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";

// Whether a kit's overlay still holds a value whose cause is `Unclassified`. That is the cause a value takes until its
// Kit is swept, and it leaves the enum with the last kit, so a kit holding one reads as open whatever its trailer says
export const checkHoldsUnclassified = (overlay: KitOverlay): boolean =>
  Object.values(overlay).some((entry) => "cause" in entry && entry.cause === KitProvisionalCause.Unclassified);
