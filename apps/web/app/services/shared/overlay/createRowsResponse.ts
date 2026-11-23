import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";
import type { WriteResponse } from "#src/models/shared/overlay/WriteResponse";

import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createConfirmation } from "#src/services/shared/overlay/createConfirmation";

// The answer of a write that returns rows: each row arrives, and the write's entry is confirmed at the version each
// Names
export const createRowsResponse = <TRow extends Versioned>(table: Table<TRow>, rows: TRow[]): WriteResponse => ({
  arrivals: rows.map((row) => createArrival(table, row)),
  confirmed: rows.map((row) => createConfirmation(table, table.keyOf(row), row.version)),
});
