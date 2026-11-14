import type { CoreColumn } from "#src/models/cutover/CoreColumn";
import type { D1Statement } from "#src/models/cutover/D1Statement";

import { InvalidOperationError, Operation } from "@esposter/shared";

export type D1Value = D1Statement["params"][number];

// The one transform from a Postgres or Azure value to the value its D1 column stores, chosen by the column's type.
// The same function runs on both sides of verify, so a column's canonical form is defined in exactly one place
export const toD1Value = (column: CoreColumn, value: unknown): D1Value => {
  if (value === null || value === undefined)
    // A non-null json column can only hold JSON null, which the driver hands back as null
    return column.notNull && column.dataType === "object json" ? "null" : null;
  switch (column.dataType) {
    case "boolean":
      return value ? 1 : 0;
    case "custom":
      return getSafeInteger(column, BigInt(getBigIntSource(column, value)));
    case "number double":
      return Number(getNumberSource(column, value));
    case "number int53":
      return getSafeInteger(column, BigInt(getBigIntSource(column, value)));
    case "object date":
      return getDateMilliseconds(column, value);
    case "object json":
      return JSON.stringify(value);
    default:
      if (typeof value === "string") return value;
      throw new InvalidOperationError(Operation.Read, column.name, "is not text, but its column stores text");
  }
};

const getDateMilliseconds = (column: CoreColumn, value: unknown): number => {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string" || typeof value === "number") return new Date(value).getTime();
  throw new InvalidOperationError(Operation.Read, column.name, "is not a timestamp");
};

const getBigIntSource = (column: CoreColumn, value: unknown): bigint | number | string => {
  if (typeof value === "string" || typeof value === "number" || typeof value === "bigint") return value;
  throw new InvalidOperationError(Operation.Read, column.name, "is not an integer");
};

const getNumberSource = (column: CoreColumn, value: unknown): number | string => {
  if (typeof value === "string" || typeof value === "number") return value;
  throw new InvalidOperationError(Operation.Read, column.name, "is not a number");
};

// D1 stores an integer as a 64-bit value that a JavaScript number carries exactly only below 2^53.
// A bitfield that reaches past that would be rounded silently, so the copy refuses it instead
const getSafeInteger = (column: CoreColumn, value: bigint): number => {
  if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER))
    throw new InvalidOperationError(Operation.Update, column.name, "holds an integer D1 cannot store exactly");
  return Number(value);
};
