import type { Clause } from "@esposter/azure";

import { getTableNullClause } from "@esposter/azure";
import deepEqual from "fast-deep-equal";

export const checkIsNullClause = (clause: Clause<Record<string, unknown>>): boolean => {
  const tableNullClause = getTableNullClause<Record<string, unknown>>(clause.key);
  return deepEqual(clause, tableNullClause);
};
