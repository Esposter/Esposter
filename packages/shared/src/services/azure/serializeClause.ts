import type { Clause } from "@/models/azure/Clause";

import { SearchOperator } from "@/models/azure/SearchOperator";
import { UnaryOperator } from "@/models/azure/UnaryOperator";

export const serializeClause = (clause: Clause): string => {
  if (clause.operator === SearchOperator.arrayContains)
    return `${clause.key}/any(x: search.in(x, '${clause.value.join(",")}'))`;
  else if (clause.operator === SearchOperator.startsWith) return `startsWith(${clause.key}, '${clause.value}')`;

  const { key, not, operator, value } = clause;
  const notPrefix = not ? `${UnaryOperator.not} ` : "";
  return `${notPrefix}${key} ${operator} ${value}`;
};
