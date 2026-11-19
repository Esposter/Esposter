import type { Confirmation } from "#src/models/shared/overlay/Confirmation";
import type { RowKey } from "#src/models/shared/overlay/RowKey";
import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

export const createConfirmation =
  <TRow extends Versioned>(table: Table<TRow>, key: RowKey, version: number): Confirmation =>
  (slotFor) => {
    const heldVersion = slotFor(table).versionOf(key);
    return heldVersion !== undefined && heldVersion >= version;
  };
