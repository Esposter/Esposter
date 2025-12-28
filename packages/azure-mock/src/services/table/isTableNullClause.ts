import type { Clause } from "@esposter/db-schema";

import { getTableNullClause } from "@esposter/db";
import deepEqual from "fast-deep-equal";

export const isTableNullClause = (clause: Clause): boolean => {
  const tableNullClause = getTableNullClause(clause.key);
  return deepEqual(clause, tableNullClause);
};
