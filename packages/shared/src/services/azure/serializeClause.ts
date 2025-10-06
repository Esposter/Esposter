import type { Clause } from "@/models/azure/Clause";

import { SearchOperator } from "@/models/azure/SearchOperator";
import { UnaryOperator } from "@/models/azure/UnaryOperator";
import { InvalidOperationError } from "@/models/error/InvalidOperationError";
import { Operation } from "@/models/shared/Operation";
import { serializeValue } from "@/services/azure/serializeValue";
import { serializeKey } from "@/services/azure/table/serializeKey";

export const serializeClause = (clause: Clause): string => {
  clause.key = serializeKey(clause.key);

  if (clause.operator === SearchOperator.arrayContains) {
    const keys = clause.key.split("/");
    if (keys.length === 1)
      return `${clause.key}/any(x: search.in(x, '${clause.value.map((v) => serializeValue(v)).join(",")}'))`;
    else if (keys.length === 2) {
      const [collectionName, propertyName] = keys;
      return `${collectionName}/any(x: search.in(x/${propertyName}, '${clause.value.map((v) => serializeValue(v)).join(",")}'))`;
    } else throw new InvalidOperationError(Operation.Read, serializeClause.name, clause.key);
  }

  const { key, not, operator, value } = clause;
  const baseClause = `${key} ${operator} ${serializeValue(value)}`;
  return not ? `${UnaryOperator.not}(${baseClause})` : baseClause;
};
