import type { StreamTableSchema } from "#src/models/streams/StreamTableSchema";
import type { Clause, SerializableValue } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { BinaryOperator, CompositeKeyPropertyNames } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { sql } from "drizzle-orm";

const COMPARISON_SQL: Record<BinaryOperator, string> = {
  [BinaryOperator.Eq]: "=",
  [BinaryOperator.Ge]: ">=",
  [BinaryOperator.Gt]: ">",
  [BinaryOperator.Le]: "<=",
  [BinaryOperator.Lt]: "<",
  [BinaryOperator.Ne]: "<>",
};

// A property path: identifiers joined by `/`, where `a/b` reads `$.a.b` in the entity's JSON
const PROPERTY_PATH_REGEX = /^[A-Za-z_]\w*(?:\/[A-Za-z_]\w*)*$/u;

// The two keys are columns. Every other property is read from the entity's JSON, and a Date is stored as `{ date }`, so a
// comparison against one reads that member
const getExpression = (key: string, isDate: boolean, table: StreamTableSchema) => {
  if (key === CompositeKeyPropertyNames.partitionKey) return table.partitionKey;
  else if (key === CompositeKeyPropertyNames.rowKey) return table.rowKey;
  else if (!PROPERTY_PATH_REGEX.test(key)) throw new InvalidOperationError(Operation.Read, compileClause.name, key);
  const path = `$.${key.replaceAll("/", ".")}${isDate ? ".date" : ""}`;
  return sql`json_extract(${table.entity}, ${path})`;
};

// SQLite has no boolean, and a JSON true reads back as 1. A Date is compared as the ISO text it is stored as
const getParameter = (value: Exclude<SerializableValue, null>): number | string => {
  if (value instanceof Date) return value.toISOString();
  else if (typeof value === "boolean") return value ? 1 : 0;
  else return value;
};

// A null is an `is null` test, the only null test SQL has
const getNullCondition = (expression: ReturnType<typeof getExpression>, operator: BinaryOperator) => {
  if (operator === BinaryOperator.Eq) return sql`${expression} is null`;
  else if (operator === BinaryOperator.Ne) return sql`${expression} is not null`;
  throw new InvalidOperationError(Operation.Read, compileClause.name, operator);
};

// Compiles one clause to a SQL condition over the table. Every value is a bound parameter, so a value cannot widen the
// condition it is part of
export const compileClause = (clause: Clause<Record<string, unknown>>, table: StreamTableSchema): SQL => {
  const { key, not, operator, value } = clause;
  const expression = getExpression(key, value instanceof Date, table);
  const condition =
    value === null
      ? getNullCondition(expression, operator)
      : sql`${expression} ${sql.raw(COMPARISON_SQL[operator])} ${getParameter(value)}`;
  return not ? sql`not (${condition})` : condition;
};
