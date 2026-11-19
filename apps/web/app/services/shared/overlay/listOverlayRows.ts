import type { Draft } from "#src/models/shared/overlay/Draft";
import type { Entry } from "#src/models/shared/overlay/Entry";
import type { SlotFor } from "#src/models/shared/overlay/SlotFor";
import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

import { clearDraft } from "#src/services/shared/overlay/clearDraft";
import { createDraft } from "#src/services/shared/overlay/createDraft";
import { createKeyedView } from "#src/services/shared/overlay/createKeyedView";

// The live rows of a table with the entries applied over held state in the order they were issued
export const listOverlayRows = <TRow extends Versioned>(
  slotFor: SlotFor,
  table: Table<TRow>,
  entries: Entry[],
): readonly Readonly<Draft<TRow>>[] => {
  const draft = createDraft();
  const view = createKeyedView(slotFor, draft);
  for (const entry of entries) entry(view);
  const rows = slotFor(table).list();
  clearDraft(draft);
  return rows;
};
