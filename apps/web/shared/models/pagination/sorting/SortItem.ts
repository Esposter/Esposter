import type { SortOrder } from "@esposter/db-schema";

// A table's sort, as the data table reads and writes it; the server is sent the sort's name, never this
export interface SortItem<T extends string> {
  key: T;
  order: SortOrder;
}
