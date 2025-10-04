import type { Clause } from "@/models/azure/Clause";

import { SearchOperator } from "@/models/azure/SearchOperator";
import { UnaryOperator } from "@/models/azure/UnaryOperator";
import { InvalidOperationError } from "@/models/error/InvalidOperationError";
import { Operation } from "@/models/shared/Operation";

export const serializeClause = (clause: Clause): string => {
  if (clause.operator === SearchOperator.arrayContains) {
    const keys = clause.key.split("/");
    if (keys.length === 1) return `${clause.key}/any(x: search.in(x, '${clause.value.join(",")}'))`;
    else if (keys.length === 2) {
      const [collectionName, propertyName] = keys;
      return `${collectionName}/any(x: search.in(x/${propertyName}, '${clause.value.join(",")}'))`;
    } else throw new InvalidOperationError(Operation.Read, serializeClause.name, clause.key);
  }

  const { key, not, operator, value } = clause;
  const notPrefix = not ? `${UnaryOperator.not} ` : "";
  return `${notPrefix}${key} ${operator} ${value}`;
};
