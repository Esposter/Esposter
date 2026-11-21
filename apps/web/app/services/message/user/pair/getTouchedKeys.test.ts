import type { Entry } from "#src/models/shared/overlay/Entry";
import type { SlotFor } from "#src/models/shared/overlay/SlotFor";

import { recordTouches } from "#src/services/shared/overlay/recordTouches";
import { describe } from "vitest";

// The distinct rows an entry touches, each as its table and key. A pair entry touches the same rows whether the rows
// Around it are held or not, so a test compares the keys read from an empty slot with the keys read from a held one
export const getTouchedKeys = (slotFor: SlotFor, entry: Entry) => [
  ...new Set(recordTouches(slotFor, entry).map(({ key, table }) => JSON.stringify({ key, table }))),
];

describe.todo("getTouchedKeys");
