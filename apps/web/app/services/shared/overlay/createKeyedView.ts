import type { KeyedView } from "#src/models/shared/overlay/KeyedView";
import type { OverlayDraft } from "#src/models/shared/overlay/OverlayDraft";
import type { SlotFor } from "#src/models/shared/overlay/SlotFor";

// The keyed view an entry is applied to, over one draft
export const createKeyedView = (slotFor: SlotFor, draft: OverlayDraft): KeyedView => ({
  get: (table, key) => slotFor(table).read(draft, key),
  set: (table, key, row) => {
    slotFor(table).write(draft, key, row);
  },
});
