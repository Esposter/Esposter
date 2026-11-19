import type { RowKey } from "#src/models/shared/overlay/RowKey";

// A row an entry reads or writes, named by its table and primary key
export interface TouchedKey {
  key: RowKey;
  table: string;
}
