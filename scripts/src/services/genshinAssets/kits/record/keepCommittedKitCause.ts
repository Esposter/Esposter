import type { KitOverlayEntry } from "#src/models/genshinAssets/kits/KitOverlayEntry";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { checkIsKitValueEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueEqual";

// The overlay entry a value gets on a compare: a source choice stands as the classifier gives it, and a cause the
// Classifier gives only as Unclassified keeps the committed cause while the committed value still stands, since the
// Sources not giving the value again is no reason to forget why it is held
export const keepCommittedKitCause = (
  entry: KitOverlayEntry | undefined,
  committedEntry: KitOverlayEntry | undefined,
  value: unknown,
): KitOverlayEntry | undefined => {
  if (entry === undefined || !("cause" in entry) || entry.cause !== KitProvisionalCause.Unclassified) return entry;
  if (committedEntry === undefined || !("cause" in committedEntry)) return entry;
  if (committedEntry.cause === KitProvisionalCause.Unclassified) return entry;
  if (!checkIsKitValueEqual(committedEntry.value, value)) return entry;
  return { ...entry, cause: committedEntry.cause };
};
