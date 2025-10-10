import type { Clause } from "@/models/azure/Clause";

import { SearchOperator } from "@/models/azure/search/SearchOperator";
import { UnaryOperator } from "@/models/azure/UnaryOperator";
import { serializeKey } from "@/services/azure/table/serializeKey";
import { serializeValue } from "@/services/azure/transformer/serializeValue";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const serializeClause = (clause: Clause): string => {
  clause.key = serializeKey(clause.key);

  if (clause.operator === SearchOperator.arrayContains) {
    const keys = clause.key.split("/").map((key) => serializeKey(key));
    if (keys.length === 1) return `${keys[0]}/any(x: search.in(x, ${serializeValue(clause.value.join(","))}))`;
    else if (keys.length === 2) {
      const [collectionName, propertyName] = keys;
      return `${collectionName}/any(x: search.in(x/${propertyName}, ${serializeValue(clause.value.join(","))}))`;
    } else throw new InvalidOperationError(Operation.Read, serializeClause.name, clause.key);
  }

  const { key, not, operator, value } = clause;
  const baseClause = `${key} ${operator} ${serializeValue(value)}`;
  return not ? `${UnaryOperator.not}(${baseClause})` : baseClause;
};
