import type { CoreColumn } from "#src/models/cutover/CoreColumn";
import type { D1Statement } from "#src/models/cutover/D1Statement";

import { KEYSET_PAGE_SIZE } from "#src/services/cutover/constants";
import { buildKeysetPage } from "#src/services/cutover/core/buildKeysetPage";

interface ReadKeysetRowsOptions {
  columns: CoreColumn[];
  dialect: "postgres" | "sqlite";
  keyColumns: CoreColumn[];
  // Runs one page's statement against the database and returns its rows keyed by column name
  readPage: (statement: D1Statement) => Promise<Record<string, unknown>[]>;
  qualifiedTableName: string;
}

// Every row of a table in primary-key order, one keyset page at a time. The last row of a page is the next page's keyset,
// so the walk resumes exactly where it stopped whatever the page size
export const readKeysetRows = async function* ({
  columns,
  dialect,
  keyColumns,
  qualifiedTableName,
  readPage,
}: ReadKeysetRowsOptions): AsyncGenerator<Record<string, unknown>> {
  let after: unknown[] | undefined;
  for (;;) {
    const rows = await readPage(
      buildKeysetPage({ after, columns, dialect, keyColumns, limit: KEYSET_PAGE_SIZE, qualifiedTableName }),
    );
    for (const row of rows) yield row;
    const lastRow = rows.at(-1);
    if (rows.length < KEYSET_PAGE_SIZE || !lastRow) return;
    after = keyColumns.map(({ name }) => lastRow[name]);
  }
};
