import type { Entry } from "#src/models/shared/overlay/Entry";
import type { SlotFor } from "#src/models/shared/overlay/SlotFor";
import type { TouchedKey } from "#src/models/shared/overlay/TouchedKey";

import { clearDraft } from "#src/services/shared/overlay/clearDraft";
import { createDraft } from "#src/services/shared/overlay/createDraft";
import { createKeyedView } from "#src/services/shared/overlay/createKeyedView";

// Runs an entry once over a fresh draft, so each read and write answers from held state and nothing it writes outlives
// The run. The keys it touched are the write's queue keys, and its result is dropped with the draft
export const recordTouches = (slotFor: SlotFor, entry: Entry): TouchedKey[] => {
  const draft = createDraft();
  entry(createKeyedView(slotFor, draft));
  clearDraft(draft);
  return draft.touches;
};
