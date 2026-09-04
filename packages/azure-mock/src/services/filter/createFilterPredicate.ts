import { checkIsNullClause } from "#src/services/filter/checkIsNullClause";
import { compare } from "#src/services/filter/compare";
import { BinaryOperator, deserializeClause } from "@esposter/azure";
import { takeOne } from "@esposter/shared";

export const createFilterPredicate = (filter: string): ((document: Record<string, unknown>) => boolean) => {
  // Preserve spacing when stripping parentheses so patterns like not(<clause>) still match
  const normalizedFilter = filter.replaceAll(String.raw`(`, " ").replaceAll(String.raw`)`, "");
  const andGroups = normalizedFilter.split(/\s+and\s+/iu).filter(Boolean);
  // Deserialized once at construction rather than per document per clause — the predicate is applied across
  // Every row of a table or index, so parsing inside it multiplies the regex work by the row count
  const orGroups = andGroups.map((group) =>
    group
      .split(/\s+or\s+/iu)
      .filter(Boolean)
      .map((clauseString) => {
        const clause = deserializeClause(clauseString);
        return { clause, isNull: checkIsNullClause(clause) };
      }),
  );
  return (document) => {
    for (const orGroup of orGroups) {
      let isGroupMatched = false;

      for (const { clause, isNull } of orGroup) {
        const value = takeOne(document, clause.key);
        let isMatched: boolean;

        if (isNull) isMatched = compare(BinaryOperator.eq, value, null);
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
