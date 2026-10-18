import type { KitOverlayEntry } from "#src/models/genshinAssets/kits/KitOverlayEntry";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { checkIsKitValueResolvedEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueResolvedEqual";

// The overlay entry a value gets on a compare: a source choice stands as the classifier gives it, and a cause the
// Classifier gives only as Unclassified keeps the committed cause while the committed value still stands, since the
// Sources not giving the value again is no reason to forget why it is held
export const keepCommittedKitCause = (
  entry: KitOverlayEntry | undefined,
  committedEntry: KitOverlayEntry | undefined,
  value: unknown,
  talentMultiplierMap: KitTables["talentMultiplierMap"],
): KitOverlayEntry | undefined => {
  if (entry === undefined || !("cause" in entry) || entry.cause !== KitProvisionalCause.Unclassified) return entry;
  if (committedEntry === undefined || !("cause" in committedEntry)) return entry;
  if (committedEntry.cause === KitProvisionalCause.Unclassified) return entry;
  if (!checkIsKitValueResolvedEqual(committedEntry.value, value, talentMultiplierMap)) return entry;
  return { ...entry, cause: committedEntry.cause };
};
