import type { Clause } from "@esposter/db-schema";

import { RangeOperators } from "@/services/azure/transformer/RangeOperators";
import { serializeClause } from "@/services/azure/transformer/serializeClause";
import { UnaryOperator } from "@esposter/db-schema";

export const serializeClauses = (clauses: Clause[]): string => {
  if (clauses.length === 0) return "";
  else if (clauses.length === 1) return serializeClause(clauses[0]);

  const groupedClauses = Object.groupBy(clauses, ({ key }) => key);
  const groupedStrings: string[] = [];

  for (const clauses of Object.values(groupedClauses))
    if (clauses.length === 1) groupedStrings.push(serializeClause(clauses[0]));
    else {
      const serializedClauses = clauses.map((c) => serializeClause(c));
      const isRangeClause = clauses.some(({ operator }) => RangeOperators.includes(operator));
      const groupedString = isRangeClause
        ? serializedClauses.join(` ${UnaryOperator.and} `)
        : `(${serializedClauses.join(` ${UnaryOperator.or} `)})`;
      groupedStrings.push(groupedString);
    }

  return groupedStrings.join(` ${UnaryOperator.and} `);
};
