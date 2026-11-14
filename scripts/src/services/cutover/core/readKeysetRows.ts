import type { CoreColumn } from "#src/models/cutover/CoreColumn";
import type { D1Statement } from "#src/models/cutover/D1Statement";
import type { SqlDialect } from "#src/models/cutover/SqlDialect";

import { KEYSET_PAGE_SIZE } from "#src/services/cutover/constants";
import { buildKeysetPage } from "#src/services/cutover/core/buildKeysetPage";

interface ReadKeysetRowsOptions {
  columns: CoreColumn[];
  dialect: SqlDialect;
  keyColumns: CoreColumn[];
  qualifiedTableName: string;
  // Runs one page's statement against the database and returns its rows keyed by column name
  readPage: (statement: D1Statement) => Promise<Record<string, unknown>[]>;
}

// Every row of a table in primary-key order, one keyset page at a time. The last row of a page is the next page's keyset.
// The walk therefore resumes exactly where it stopped, whatever the page size
export const readKeysetRows = async function* ({
  columns,
  dialect,
  keyColumns,
  qualifiedTableName,
  readPage,
}: ReadKeysetRowsOptions): AsyncGenerator<Record<string, unknown>> {
  let after: undefined | unknown[];
  for (;;) {
    // oxlint-disable-next-line no-await-in-loop -- pagination: the next page's keyset is the last row of the one before
    const rows = await readPage(
      buildKeysetPage({ after, columns, dialect, keyColumns, limit: KEYSET_PAGE_SIZE, qualifiedTableName }),
    );
    for (const row of rows) yield row;
    const lastRow = rows.at(-1);
    if (rows.length < KEYSET_PAGE_SIZE || !lastRow) return;
    after = keyColumns.map(({ name }) => lastRow[name]);
  }
};
