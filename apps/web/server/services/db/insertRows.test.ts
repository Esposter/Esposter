import type { Database } from "@esposter/db-schema";
import type { SQLiteInsertValue, SQLiteTable } from "drizzle-orm/sqlite-core";

import { D1_MAX_BOUND_PARAMETERS } from "#server/services/db/constants";
import { chunk } from "@esposter/shared";
import { getColumns } from "drizzle-orm";
import { describe } from "vitest";

// A statement holds as many rows as D1's bound-parameter cap fits, a row binding at most one value per column of its table.
// The statements go in batches of a hundred, one request each, since a statement per request overruns a test's timeout
export const insertRows = async <TTable extends SQLiteTable>(
  db: Database,
  table: TTable,
  rows: SQLiteInsertValue<TTable>[],
) => {
  const rowsPerStatement = Math.floor(D1_MAX_BOUND_PARAMETERS / Object.keys(getColumns(table)).length);
  const statements = chunk(rows, rowsPerStatement).map((batch) => db.insert(table).values(batch));
  for (const group of chunk(statements, 100)) {
    const [firstStatement, ...restStatements] = group;
    // oxlint-disable-next-line no-await-in-loop -- Committed prefix: a failed batch stops the groups behind it, and the groups before it stay committed
    if (firstStatement) await db.batch([firstStatement, ...restStatements]);
  }
};

describe.todo("insertRows");
