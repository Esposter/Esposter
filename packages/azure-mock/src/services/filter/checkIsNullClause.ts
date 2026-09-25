import type { Clause } from "@esposter/azure";

import { getTableNullClause } from "@esposter/azure";
import deepEqual from "fast-deep-equal";

export const checkIsNullClause = (clause: Clause<Record<string, unknown>>): boolean => {
  // eslint-disable-next-line no-restricted-syntax -- A key read off an arbitrary clause has no entity for the call to infer from
  const tableNullClause = getTableNullClause<Record<string, unknown>>(clause.key);
  return deepEqual(clause, tableNullClause);
};
