import type { Clause } from "@esposter/db-schema";

import { createFilterPredicate } from "@/services/filter/createFilterPredicate";
import { serializeClauses } from "@esposter/db";

export const applyFilter = <T extends Record<string, unknown>>(documents: T[], clauses: Clause<T>[]): T[] => {
  const predicate = createFilterPredicate(serializeClauses(clauses));
  return documents.filter((document) => predicate(document));
};
