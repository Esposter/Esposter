import type { Clause } from "@esposter/db-schema";

import { BinaryOperator } from "@esposter/db-schema";
// https://stackoverflow.com/questions/4228460/querying-azure-table-storage-for-null-values
export const getTableNullClause = <T extends object>(key: keyof T & string): Clause<T> => ({
  key,
  not: true,
  operator: BinaryOperator.ne,
  value: Number.NaN,
});
