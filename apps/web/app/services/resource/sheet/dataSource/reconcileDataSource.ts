import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { inheritIdentity } from "@/services/resource/sheet/dataSource/inheritIdentity";
import { toComparable } from "@/services/resource/sheet/dataSource/toComparable";
import { checkIsDeepEqual } from "@esposter/shared";

// An import builds every column and row new, and a new item mints a random id and fresh timestamps, so the same
// File imported twice was never the same bytes: the version store, which stores identical content once and similar
// Content as a delta, kept every id again on each import. The sheet being replaced hands its identities over
// Instead — a column by the header it came from, a row by its position, the only identity a file's row has — so
// An unchanged item keeps all three fields and a changed one keeps its id and creation time
export const reconcileDataSource = (dataSource: DataSource, previousDataSource: DataSource) => {
  const previousColumnMap = new Map(previousDataSource.columns.map((column) => [column.sourceName, column]));
  for (const column of dataSource.columns) {
    const previousColumn = previousColumnMap.get(column.sourceName);
    if (!previousColumn) continue;
    // Handed over once, so two columns can never end up sharing the id the content schema requires be unique
    previousColumnMap.delete(column.sourceName);
    inheritIdentity(column, previousColumn, checkIsDeepEqual(toComparable(column), toComparable(previousColumn)));
  }

  for (const [index, row] of dataSource.rows.entries()) {
    const previousRow = previousDataSource.rows[index];
    if (!previousRow) break;
    inheritIdentity(row, previousRow, checkIsDeepEqual(row.data, previousRow.data));
  }
};
