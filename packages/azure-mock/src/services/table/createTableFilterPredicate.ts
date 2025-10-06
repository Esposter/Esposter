import type { TableEntity } from "@azure/data-tables";

import { compare } from "@/services/table/compare";
import { isTableNullClause } from "@/services/table/isTableNullClause";
import { BinaryOperator, deserializeClause } from "@esposter/shared";

export const createTableFilterPredicate = <T extends Record<string, unknown>>(
  filter: string,
): ((entity: TableEntity<T>) => boolean) => {
  // Preserve spacing when stripping parentheses so patterns like not(<clause>) still match
  const normalizedFilter = filter.replaceAll(String.raw`(`, " ").replaceAll(String.raw`)`, "");
  const andGroups = normalizedFilter.split(/\s+and\s+/i).filter(Boolean);
  const orGroups = andGroups.map((group) => group.split(/\s+or\s+/i).filter(Boolean));
  return (entity) => {
    for (const orGroup of orGroups) {
      let isGroupMatched = false;

      for (const group of orGroup) {
        const clause = deserializeClause(group);
        const value = entity[clause.key as keyof typeof entity];
        let isMatched = false;

        if (isTableNullClause(clause)) isMatched = compare(BinaryOperator.eq, value, null);
        else {
          const comparisonResult = compare(
            clause.operator,
            value,
            clause.value as (typeof entity)[keyof typeof entity] | null,
          );
          isMatched = clause.not ? !comparisonResult : comparisonResult;
        }

        if (isMatched) {
          isGroupMatched = true;
          break;
        }
      }

      if (!isGroupMatched) return false;
    }

    return true;
  };
};
