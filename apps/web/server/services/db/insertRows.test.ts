import type { Database } from "@esposter/db-schema";
import type { SQLiteInsertValue, SQLiteTable } from "drizzle-orm/sqlite-core";

import { getRowsPerStatement } from "@esposter/db";
import { chunk } from "@esposter/shared";
import { describe } from "vitest";

// The statements go in batches of a hundred, one request each, since a statement per request overruns a test's timeout
export const insertRows = async <TTable extends SQLiteTable>(
  db: Database,
  table: TTable,
  rows: SQLiteInsertValue<TTable>[],
) => {
  const statements = chunk(rows, getRowsPerStatement(table)).map((batch) => db.insert(table).values(batch));
  for (const group of chunk(statements, 100)) {
    const [firstStatement, ...restStatements] = group;
    // oxlint-disable-next-line no-await-in-loop -- Committed prefix: a failed batch stops the groups behind it, and the groups before it stay committed
    if (firstStatement) await db.batch([firstStatement, ...restStatements]);
  }
};

describe.todo("insertRows");
