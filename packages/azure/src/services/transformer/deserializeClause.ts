import type { Clause } from "#src/models/Clause";

import { BinaryOperator } from "#src/models/BinaryOperator";
import { deserializeKey } from "#src/services/table/deserializeKey";
import { CLAUSE_REGEX } from "#src/services/transformer/constants";
import { deserializeValue } from "#src/services/transformer/deserializeValue";
import { normalizeString, NotFoundError } from "@esposter/shared";

export const deserializeClause = (
  serializedClause: string,
): Extract<Clause<Record<string, unknown>>, { operator: BinaryOperator }> => {
  const normalizedClause = normalizeString(serializedClause);
  const match = CLAUSE_REGEX.exec(normalizedClause);
  if (!match) throw new NotFoundError(deserializeClause.name, normalizedClause);
  // The four groups CLAUSE_REGEX names, rather than `keyof Clause` — the clause union's common keys exclude
  // `value`, because a collection-emptiness clause carries none
  const groups = match.groups as Record<"key" | "not" | "operator" | "value", string> | undefined;
  if (!groups) throw new NotFoundError(deserializeClause.name, normalizedClause);
  return {
    key: deserializeKey(groups.key),
    not: Boolean(groups.not),
    operator: groups.operator as BinaryOperator,
    value: deserializeValue(groups.value),
  };
};
