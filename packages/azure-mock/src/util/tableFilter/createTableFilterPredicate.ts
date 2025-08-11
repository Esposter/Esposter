import type { TableEntity } from "@azure/data-tables";

import { compare } from "@/util/tableFilter/compare";
import { parseClause } from "@/util/tableFilter/parseClause";
import { NotFoundError, uncapitalize } from "@esposter/shared";

export const createTableFilterPredicate = <T extends object>(filter: string): ((entity: TableEntity<T>) => boolean) => {
  const normalizedFilter = filter.replaceAll(String.raw`(`, "").replaceAll(String.raw`)`, "");
  const andGroups = normalizedFilter.split(/\s+and\s+/i).filter(Boolean);
  const orGroups = andGroups.map((group) => group.split(/\s+or\s+/i).filter(Boolean));
  return (entity) => {
    for (const group of orGroups) {
      let isGroupMatched = false;
      for (const rawClause of group) {
        const clause = parseClause(rawClause);
        const normalizedClauseKey = uncapitalize(clause.key);
        if (!(normalizedClauseKey in entity))
          throw new NotFoundError(
            createTableFilterPredicate.name,
            JSON.stringify({ entity, filter, key: normalizedClauseKey }),
          );
        if (compare(clause.operator, String(entity[normalizedClauseKey as keyof typeof entity]), clause.value)) {
          isGroupMatched = true;
          break;
        }
      }
      if (!isGroupMatched) return false;
    }
    return true;
  };
};
