import type { Clause } from "@esposter/azure";

import { deserializeKey } from "#src/services/azure/table/deserializeKey";
import { CLAUSE_REGEX } from "#src/services/azure/transformer/constants";
import { deserializeValue } from "#src/services/azure/transformer/deserializeValue";
import { BinaryOperator } from "@esposter/azure";
import { normalizeString, NotFoundError } from "@esposter/shared";

export const deserializeClause = (
  string: string,
): Extract<Clause<Record<string, unknown>>, { operator: BinaryOperator }> => {
  const normalizedString = normalizeString(string);
  const match = CLAUSE_REGEX.exec(normalizedString);
  if (!match) throw new NotFoundError(deserializeClause.name, normalizedString);
  // The four groups CLAUSE_REGEX names, rather than `keyof Clause` — the clause union's common keys exclude
  // `value`, because a collection-emptiness clause carries none
  const groups = match.groups as Record<"key" | "not" | "operator" | "value", string> | undefined;
  if (!groups) throw new NotFoundError(deserializeClause.name, normalizedString);
  return {
    key: deserializeKey(groups.key),
    not: Boolean(groups.not),
    operator: groups.operator as BinaryOperator,
    value: deserializeValue(groups.value),
  };
};
