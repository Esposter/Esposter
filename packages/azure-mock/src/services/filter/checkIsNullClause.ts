import type { Clause } from "@esposter/azure";

import { getTableNullClause } from "@esposter/azure";
import { checkIsDeepEqual } from "@esposter/shared";

export const checkIsNullClause = (clause: Clause<Record<string, unknown>>): boolean => {
  // eslint-disable-next-line no-restricted-syntax -- A key read off an arbitrary clause has no entity for the call to infer from
  const tableNullClause = getTableNullClause<Record<string, unknown>>(clause.key);
  return checkIsDeepEqual(clause, tableNullClause);
};
