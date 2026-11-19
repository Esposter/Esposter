import type { Arrival } from "#src/models/shared/overlay/Arrival";
import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

export const createArrival =
  <TRow extends Versioned>(table: Table<TRow>, row: TRow): Arrival =>
  (slotFor) => {
    slotFor(table).arrive(row);
  };
