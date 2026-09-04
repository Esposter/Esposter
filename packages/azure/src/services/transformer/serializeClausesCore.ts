import type { Clause } from "#src/models/Clause";

import { UnaryOperator } from "#src/models/UnaryOperator";
import { RangeOperators } from "#src/services/transformer/RangeOperators";
import { serializeClause } from "#src/services/transformer/serializeClause";
import { takeOne } from "@esposter/shared";

// The isTableFilter flag threads down to serializeValue so Date literals render as the target service expects:
// Azure Table needs datetime'<iso>', Azure Search needs the bare ISO string.
export const serializeClausesCore = (clauses: Clause<Record<string, unknown>>[], isTableFilter: boolean): string => {
  if (clauses.length === 0) return "";
  else if (clauses.length === 1) return serializeClause(takeOne(clauses), isTableFilter);

  const groupedClauses = Object.groupBy(clauses, ({ key }) => key);
  const groupedStrings: string[] = [];

  for (const clauseGroup of Object.values(groupedClauses))
    if (clauseGroup.length === 1) groupedStrings.push(serializeClause(takeOne(clauseGroup), isTableFilter));
    else {
      const serializedClauses = clauseGroup.map((clause) => serializeClause(clause, isTableFilter));
      const isRangeClause = clauseGroup.some(({ operator }) => RangeOperators.includes(operator));
      const groupedString = isRangeClause
        ? serializedClauses.join(` ${UnaryOperator.and} `)
        : `(${serializedClauses.join(` ${UnaryOperator.or} `)})`;
      groupedStrings.push(groupedString);
    }

  return groupedStrings.join(` ${UnaryOperator.and} `);
};
