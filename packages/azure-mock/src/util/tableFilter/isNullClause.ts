import type { Clause } from "@esposter/shared";

import { getNullClause } from "@esposter/shared";

export const isNullClause = ({ key, not, operator, value }: Clause): boolean => {
  const nullClause = getNullClause(key);
  return not === nullClause.not && operator === nullClause.operator && value === nullClause.value;
};
