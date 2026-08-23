import type { Clause } from "@esposter/azure";

import { createFilterPredicate } from "#src/services/filter/createFilterPredicate";
import { serializeClauses } from "@esposter/azure";

export const applyFilter = <T extends Record<string, unknown>>(documents: T[], clauses: Clause<T>[]): T[] => {
  const predicate = createFilterPredicate(serializeClauses(clauses));
  return documents.filter((document) => predicate(document));
};
