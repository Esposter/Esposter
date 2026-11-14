import type { CoreTable } from "#src/models/cutover/CoreTable";

import { requireNoReadableTokenColumn } from "#src/services/cutover/ids/requireNoReadableTokenColumn";
import { webhooksInMessage } from "@esposter/db-schema";
import { getTableName } from "drizzle-orm";
import { describe, expect, test } from "vitest";

describe(requireNoReadableTokenColumn, () => {
  const TOKEN_COLUMN = { dataType: "string", name: "token", notNull: true };
  const TOKEN_HASH_COLUMN = { dataType: "string", name: "tokenHash", notNull: true };
  const WEBHOOKS_TABLE_NAME = getTableName(webhooksInMessage);
  const createCoreTable = (columns: CoreTable["columns"]): CoreTable => ({
    columns,
    foreignTableNames: [],
    name: WEBHOOKS_TABLE_NAME,
    pgSchema: "message",
    pgTable: "webhooks",
    primaryKeyColumns: [],
    timestampUniqueColumnGroups: [],
  });

  test("refuses a table that still keeps the readable token column, so no token is copied in the clear", () => {
    expect.hasAssertions();

    const table = createCoreTable([TOKEN_COLUMN]);

    expect(() => requireNoReadableTokenColumn(table)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: message_webhooks, keeps the readable token column, which the copy must not write]`,
    );
  });

  test("accepts the table once its token column holds only the hash", () => {
    expect.hasAssertions();

    const table = createCoreTable([TOKEN_HASH_COLUMN]);

    expect(() => requireNoReadableTokenColumn(table)).not.toThrow();
  });
});
