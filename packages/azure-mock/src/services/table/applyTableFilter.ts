import type { TableEntity } from "@azure/data-tables";
import type { Clause } from "@esposter/shared";

import { createTableFilterPredicate } from "@/services/table/createTableFilterPredicate";
import { serializeClauses } from "@esposter/shared";

export const applyTableFilter = <T extends Record<string, unknown>>(
  entities: TableEntity<T>[],
  clauses: Clause[],
): TableEntity<T>[] => {
  const predicate = createTableFilterPredicate<T>(serializeClauses(clauses));
  return entities.filter((e) => predicate(e));
};
