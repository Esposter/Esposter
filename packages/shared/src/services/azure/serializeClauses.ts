import type { Clause } from "@/models/azure/Clause";

import { UnaryOperator } from "@/models/azure/UnaryOperator";
import { serializeClause } from "@/services/azure/serializeClause";

export const serializeClauses = (clauses: Clause[]): string => {
  if (clauses.length === 0) return "";

  const groupedClauses = Object.groupBy(clauses, (clause) => clause.key);
  const groupedStrings: string[] = [];

  for (const clauses of Object.values(groupedClauses).filter((groupedClause) => groupedClause !== undefined)) {
    const groupedString = clauses.map(serializeClause).join(` ${UnaryOperator.or} `);
    groupedStrings.push(`(${groupedString})`);
  }

  return groupedStrings.length > 0 ? `(${groupedStrings.join(` ${UnaryOperator.and} `)})` : "";
};
