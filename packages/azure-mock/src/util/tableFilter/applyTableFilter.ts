import type { TableEntity } from "@azure/data-tables";

import { createTableFilterPredicate } from "@/util/tableFilter/createTableFilterPredicate";

export const applyTableFilter = <T extends object>(entities: TableEntity<T>[], filter: string): TableEntity<T>[] => {
  const predicate = createTableFilterPredicate<T>(filter);
  return entities.filter((e) => predicate(e));
};
