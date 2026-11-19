import type { SQLWrapper } from "drizzle-orm";

import { getStatementConfig } from "#src/services/realtime/getStatementConfig";
import { checkIsRecord } from "#src/util/object/checkIsRecord";
import { is, Param } from "drizzle-orm";
import { SQLiteInsertBase, SQLiteUpdateBase } from "drizzle-orm/sqlite-core";

// A value a topic can name is a scalar: SQL names no value until the database runs it
const checkIsLiteral = (value: unknown): value is bigint | boolean | number | string =>
  ["bigint", "boolean", "number", "string"].includes(typeof value);

// The rows a write names when it asks for no RETURNING: the rows its own values make. An insert's values are the rows it writes,
// And an update's set holds the scope values its rows move to. A parameter is named by the value it binds, and a value held as
// SQL is left out, since no value is known until the database runs it
export const getWrittenRows = (statement: SQLWrapper): Record<string, unknown>[] => {
  const config = getStatementConfig(statement);
  const carried = is(statement, SQLiteInsertBase)
    ? config?.values
    : is(statement, SQLiteUpdateBase)
      ? [config?.set]
      : undefined;
  const records: unknown[] = Array.isArray(carried) ? carried : [];
  return records
    .flatMap((record) => (checkIsRecord(record) ? [record] : []))
    .map((record) =>
      Object.fromEntries(
        Object.entries(record).flatMap(([key, value]) => {
          const literal: unknown = is(value, Param) ? value.value : value;
          return checkIsLiteral(literal) ? [[key, literal]] : [];
        }),
      ),
    );
};
