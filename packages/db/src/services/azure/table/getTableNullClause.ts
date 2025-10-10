import type { Clause } from "@/models/azure/Clause";

import { BinaryOperator } from "@/models/azure/BinaryOperator";
// https://stackoverflow.com/questions/4228460/querying-azure-table-storage-for-null-values
export const getTableNullClause = (key: Clause["key"]): Clause => ({
  key,
  not: true,
  operator: BinaryOperator.ne,
  value: Number.NaN,
});
