import type { Clause } from "#src/models/Clause";

import { BinaryOperator } from "#src/models/BinaryOperator";

// https://stackoverflow.com/questions/4228460/querying-azure-table-storage-for-null-values
export const getTableNullClause = <T extends object>(key: keyof T & string): Clause<T> => ({
  key,
  not: true,
  operator: BinaryOperator.ne,
  value: Number.NaN,
});
