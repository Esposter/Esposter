import type { Clause } from "@/models/azure/Clause";

import { UnaryOperator } from "@/models/azure/UnaryOperator";
import { RangeOperators } from "@/services/azure/constants";
import { serializeClause } from "@/services/azure/serializeClause";

export const serializeClauses = (clauses: Clause[]): string => {
  if (clauses.length === 0) return "";
  else if (clauses.length === 1) return serializeClause(clauses[0]);

  const groupedClauses = Object.groupBy(clauses, ({ key }) => key);
  const groupedStrings: string[] = [];

  for (const clauses of Object.values(groupedClauses))
    if (clauses.length === 1) groupedStrings.push(serializeClause(clauses[0]));
    else {
      const isRangeClause = clauses.some(({ operator }) => RangeOperators.includes(operator));
      const groupedString = clauses
        .map((c) => serializeClause(c))
        .join(` ${isRangeClause ? UnaryOperator.and : UnaryOperator.or} `);
      groupedStrings.push(`(${groupedString})`);
    }

  return groupedStrings.join(` ${UnaryOperator.and} `);
};
