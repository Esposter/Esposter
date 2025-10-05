import type { Clause } from "@esposter/shared";

import { getTableNullClause } from "@esposter/shared";

export const isTableNullClause = ({ key, not, operator, value }: Clause): boolean => {
  const tableNullClause = getTableNullClause(key);
  return not === tableNullClause.not && operator === tableNullClause.operator && value === tableNullClause.value;
};
