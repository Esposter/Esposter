import type { Clause } from "@/models/azure/Clause";

import { UnaryOperator } from "@/models/azure/UnaryOperator";
import { serializeClause } from "@/services/azure/serializeClause";

export const serializeClauses = (clauses: Clause[]): string => {
  if (clauses.length === 0) return "";
  else if (clauses.length === 1) return serializeClause(clauses[0]);

  const groupedClauses = Object.groupBy(clauses, ({ key }) => key);
  const groupedStrings: string[] = [];

  for (const clauses of Object.values(groupedClauses).filter((groupedClause) => groupedClause !== undefined)) {
    if (clauses.length === 0) continue;
    else if (clauses.length === 1) {
      groupedStrings.push(serializeClause(clauses[0]));
      continue;
    } else {
      const groupedString = clauses.map(serializeClause).join(` ${UnaryOperator.or} `);
      groupedStrings.push(`(${groupedString})`);
    }
  }

  return groupedStrings.join(` ${UnaryOperator.and} `);
};
