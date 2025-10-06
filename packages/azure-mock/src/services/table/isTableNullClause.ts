import type { Clause } from "@esposter/shared";

import { getTableNullClause } from "@esposter/shared";
import deepEqual from "fast-deep-equal";

export const isTableNullClause = (clause: Clause): boolean => {
  const tableNullClause = getTableNullClause(clause.key);
  return deepEqual(clause, tableNullClause);
};
