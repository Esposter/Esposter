import type { CoreColumn } from "#src/models/cutover/CoreColumn";
import type { D1Statement } from "#src/models/cutover/D1Statement";

import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";

interface KeysetPageOptions {
  // The keyset's last row, or undefined for the first page
  after?: unknown[];
  columns: CoreColumn[];
  dialect: "postgres" | "sqlite";
  keyColumns: CoreColumn[];
  limit: number;
  // The table's qualified name, already quoted
  qualifiedTableName: string;
}

// A keyset page: rows past the last one read, in primary-key order, so every page is one index seek and nothing is skipped
// or read twice. Text keys compare as bytes on Postgres (C collation, the order SQLite's binary collation uses), so both
// sides walk the keys in the same order
export const buildKeysetPage = ({
  after,
  columns,
  dialect,
  keyColumns,
  limit,
  qualifiedTableName,
}: KeysetPageOptions): D1Statement => {
  const params: D1Statement["params"] = [];
  const placeholder = (value: unknown) => {
    params.push(toParam(dialect, value));
    return dialect === "postgres" ? `$${params.length}` : "?";
  };
  const keyExpression = (column: CoreColumn) =>
    dialect === "postgres" && column.dataType.startsWith("string")
      ? `(${quoteIdentifier(column.name)}::text) COLLATE "C"`
      : quoteIdentifier(column.name);
  const predicate = after
    ? `WHERE ${keyColumns
        .map((column, index) => {
          const equalities = keyColumns
            .slice(0, index)
            .map((earlier, earlierIndex) => `${keyExpression(earlier)} = ${placeholder(after[earlierIndex])}`);
          const greater = `${keyExpression(column)} > ${placeholder(after[index])}`;
          return `(${[...equalities, greater].join(" AND ")})`;
        })
        .join(" OR ")}`
    : "";
  const selectList = columns.map(({ name }) => quoteIdentifier(name)).join(", ");
  const orderBy = keyColumns.map((column) => `${keyExpression(column)} ASC`).join(", ");
  return {
    params,
    sql: `SELECT ${selectList} FROM ${qualifiedTableName} ${predicate} ORDER BY ${orderBy} LIMIT ${limit}`,
  };
};

// A keyset value is bound the way its side stores it: Postgres takes a timestamp as its ISO text, D1 as epoch milliseconds
const toParam = (dialect: "postgres" | "sqlite", value: unknown): D1Statement["params"][number] => {
  if (value instanceof Date) return dialect === "postgres" ? value.toISOString() : value.getTime();
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string" || typeof value === "number" || value === null) return value;
  return String(value);
};
