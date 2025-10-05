import type { TableEntity } from "@azure/data-tables";
import type { Clause } from "@esposter/shared";

import { createTableFilterPredicate } from "@/util/tableFilter/createTableFilterPredicate";
import { serializeClauses } from "@esposter/shared";

export const applyTableFilter = <T extends object>(entities: TableEntity<T>[], clauses: Clause[]): TableEntity<T>[] => {
  const predicate = createTableFilterPredicate<T>(serializeClauses(clauses));
  return entities.filter((e) => predicate(e));
};
