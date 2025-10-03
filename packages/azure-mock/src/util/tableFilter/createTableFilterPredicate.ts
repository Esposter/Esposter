import type { TableEntity } from "@azure/data-tables";

import { compare } from "@/util/tableFilter/compare";
import { isNullClause } from "@/util/tableFilter/isNullClause";
import { parseClause } from "@/util/tableFilter/parseClause";
import { BinaryOperator, uncapitalize } from "@esposter/shared";

export const createTableFilterPredicate = <T extends object>(filter: string): ((entity: TableEntity<T>) => boolean) => {
  // Preserve spacing when stripping parentheses so patterns like not(<clause>) still match
  const normalizedFilter = filter.replaceAll(String.raw`(`, " ").replaceAll(String.raw`)`, "");
  const andGroups = normalizedFilter.split(/\s+and\s+/i).filter(Boolean);
  const orGroups = andGroups.map((group) => group.split(/\s+or\s+/i).filter(Boolean));
  return (entity) => {
    for (const group of orGroups) {
      let isGroupMatched = false;

      for (const rawClause of group) {
        const clause = parseClause(rawClause);
        const normalizedClauseKey = uncapitalize(clause.key);
        const value = entity[normalizedClauseKey as keyof typeof entity];
        let isMatched = false;

        if (isNullClause(clause)) isMatched = compare(BinaryOperator.eq, value, null);
        else {
          const comparisonResult = compare(clause.operator, String(value), clause.value);
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
