import type { Clause } from "#src/models/shared/Clause";

import { BinaryOperator } from "#src/models/shared/BinaryOperator";

// https://stackoverflow.com/questions/4228460/querying-azure-table-storage-for-null-values
export const getTableNullClause = <T extends object>(key: keyof T & string): Clause<T> => ({
  key,
  not: true,
  operator: BinaryOperator.ne,
  value: Number.NaN,
});
