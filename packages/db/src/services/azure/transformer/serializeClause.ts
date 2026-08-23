import type { Clause } from "@esposter/azure";

import { serializeKey } from "#src/services/azure/table/serializeKey";
import { SearchOperator, serializeValue, UnaryOperator } from "@esposter/azure";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const serializeClause = (clause: Clause<Record<string, unknown>>, isTableFilter = false): string => {
  // Each path segment is serialized on its own rather than the joined key, and the result is a local: a clause
  // Is the caller's object, and writing the serialized key back onto it makes the same array serialize
  // Differently the second time anything reads it
  const keys = clause.key.split("/").map((key) => serializeKey(key));
  const clauseKey = keys.join("/");
  // Non-emptiness of the collection itself, so there is no value to compare and nothing to project onto x
  if (clause.operator === SearchOperator.arrayAny) return `${clauseKey}/any()`;
  else if (clause.operator === SearchOperator.arrayContains) {
    const serializedValue = serializeValue(clause.value.join(","));
    if (keys.length === 1) return `${clauseKey}/any(x: search.in(x, ${serializedValue}))`;
    else if (keys.length === 2) {
      const [collectionName, propertyName] = keys;
      return `${collectionName}/any(x: search.in(x/${propertyName}, ${serializedValue}))`;
    } else throw new InvalidOperationError(Operation.Read, serializeClause.name, clause.key);
  }

  const { not, operator, value } = clause;
  const baseClause = `${clauseKey} ${operator} ${serializeValue(value, isTableFilter)}`;
  return not ? `${UnaryOperator.not}(${baseClause})` : baseClause;
};
