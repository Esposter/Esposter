import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";
import type { WriteResponse } from "#src/models/shared/overlay/WriteResponse";

import { createRowsResponse } from "#src/services/shared/overlay/createRowsResponse";

// The answer of a write that returns one row: the row arrives, and the write's entry is confirmed at the version it names
export const createRowResponse = <TRow extends Versioned>(table: Table<TRow>, row: TRow): WriteResponse =>
  createRowsResponse(table, [row]);
