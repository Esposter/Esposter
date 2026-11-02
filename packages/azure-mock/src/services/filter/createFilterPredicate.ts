import { checkIsNullClause } from "#src/services/filter/checkIsNullClause";
import { compare } from "#src/services/filter/compare";
import { BinaryOperator, deserializeClause } from "@esposter/azure";
import { takeOne } from "@esposter/shared";

// A quoted literal is set aside before the filter is split on `and`/`or` and stripped of parentheses, so a value that
// Holds any of those reads as the value it is, as the service reads it. Its placeholder has no space or parenthesis for
// The splitting to find, and the literal is put back before its clause is deserialized
const LITERAL_REGEX = /'(?:[^']|'')*'/gu;
const LITERAL_PLACEHOLDER = "";
const LITERAL_PLACEHOLDER_REGEX = new RegExp(`${LITERAL_PLACEHOLDER}(\\d+)${LITERAL_PLACEHOLDER}`, "gu");

export const createFilterPredicate = (filter: string): ((document: Record<string, unknown>) => boolean) => {
  const literals: string[] = [];
  const maskedFilter = filter.replaceAll(LITERAL_REGEX, (literal) => {
    literals.push(literal);
    return `${LITERAL_PLACEHOLDER}${literals.length - 1}${LITERAL_PLACEHOLDER}`;
  });
  // Preserve spacing when stripping parentheses so patterns like not(<clause>) still match
  const normalizedFilter = maskedFilter.replaceAll(String.raw`(`, " ").replaceAll(String.raw`)`, "");
  const andGroups = normalizedFilter.split(/\s+and\s+/iu).filter(Boolean);
  // Deserialized once at construction rather than per document per clause — the predicate is applied across
  // Every row of a table or index, so parsing inside it multiplies the regex work by the row count
  const orGroups = andGroups.map((group) =>
    group
      .split(/\s+or\s+/iu)
      .filter(Boolean)
      .map((clauseString) => {
        const clause = deserializeClause(
          clauseString.replaceAll(LITERAL_PLACEHOLDER_REGEX, (_placeholder, index: string) =>
            takeOne(literals, Number(index)),
          ),
        );
        return { clause, isNull: checkIsNullClause(clause) };
      }),
  );
  return (document) => {
    for (const orGroup of orGroups) {
      let isGroupMatched = false;

      for (const { clause, isNull } of orGroup) {
        const value = takeOne(document, clause.key);
        let isMatched: boolean;

        if (isNull) isMatched = compare(BinaryOperator.Eq, value, null);
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
