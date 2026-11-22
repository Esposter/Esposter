import type { KeyColumnNames } from "#src/models/shared/overlay/KeyColumnNames";
import type { TableSource } from "#src/models/shared/overlay/TableSource";
import type { ValuesOf } from "#src/models/shared/overlay/ValuesOf";

// The key a row of a table is read by: one level per key column, typed by the column it reads
export type RowKeyOf<TSource extends TableSource> = ValuesOf<KeyColumnNames<TSource>, TSource["$inferSelect"]>;
