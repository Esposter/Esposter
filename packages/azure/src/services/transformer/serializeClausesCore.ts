import type { SearchClause } from "#src/models/search/SearchClause";

import { RangeOperators } from "#src/services/transformer/RangeOperators";
import { serializeClause } from "#src/services/transformer/serializeClause";
import { UnaryOperator } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";

// Clauses on one key are or-grouped, unless one of them is a range, which and-joins them. Groups on different keys are
// and-joined
export const serializeClausesCore = (clauses: SearchClause<Record<string, unknown>>[]): string => {
  if (clauses.length === 0) return "";
  else if (clauses.length === 1) return serializeClause(takeOne(clauses));
  else {
    const groupedClauses = Object.groupBy(clauses, ({ key }) => key);
    const groupedStrings: string[] = [];

    for (const clauseGroup of Object.values(groupedClauses))
      if (clauseGroup.length === 1) groupedStrings.push(serializeClause(takeOne(clauseGroup)));
      else {
        const serializedClauses = clauseGroup.map((clause) => serializeClause(clause));
        const isRangeClause = clauseGroup.some(({ operator }) => RangeOperators.includes(operator));
        const groupedString = isRangeClause
          ? serializedClauses.join(` ${UnaryOperator.And} `)
          : `(${serializedClauses.join(` ${UnaryOperator.Or} `)})`;
        groupedStrings.push(groupedString);
      }

    return groupedStrings.join(` ${UnaryOperator.And} `);
  }
};
