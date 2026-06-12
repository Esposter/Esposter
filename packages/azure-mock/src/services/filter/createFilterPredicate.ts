import { compare } from "@/services/filter/compare";
import { isNullClause } from "@/services/filter/isNullClause";
import { deserializeClause } from "@esposter/db";
import { BinaryOperator } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";

export const createFilterPredicate = (filter: string): ((document: Record<string, unknown>) => boolean) => {
  // Preserve spacing when stripping parentheses so patterns like not(<clause>) still match
  const normalizedFilter = filter.replaceAll(String.raw`(`, " ").replaceAll(String.raw`)`, "");
  const andGroups = normalizedFilter.split(/\s+and\s+/iu).filter(Boolean);
  const orGroups = andGroups.map((group) => group.split(/\s+or\s+/iu).filter(Boolean));
  return (document) => {
    for (const orGroup of orGroups) {
      let isGroupMatched = false;

      for (const group of orGroup) {
        const clause = deserializeClause(group);
        const value = takeOne(document, clause.key as keyof typeof document);
        let isMatched: boolean;

        if (isNullClause(clause)) isMatched = compare(BinaryOperator.eq, value, null);
        else {
          const comparisonResult = compare(
            clause.operator,
            value,
            clause.value as (typeof document)[keyof typeof document] | null,
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
