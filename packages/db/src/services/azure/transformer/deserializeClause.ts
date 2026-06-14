import type { Clause } from "@esposter/db-schema";

import { deserializeKey } from "@/services/azure/table/deserializeKey";
import { CLAUSE_REGEX } from "@/services/azure/transformer/constants";
import { deserializeValue } from "@/services/azure/transformer/deserializeValue";
import { BinaryOperator } from "@esposter/db-schema";
import { normalizeString, NotFoundError } from "@esposter/shared";

export const deserializeClause = (
  string: string,
): Extract<Clause<Record<string, unknown>>, { operator: BinaryOperator }> => {
  const normalizedString = normalizeString(string);
  const match = CLAUSE_REGEX.exec(normalizedString);
  if (!match) throw new NotFoundError(deserializeClause.name, normalizedString);
  const groups = match.groups as Record<keyof Clause<Record<string, unknown>>, string> | undefined;
  if (!groups) throw new NotFoundError(deserializeClause.name, normalizedString);
  return {
    key: deserializeKey(groups.key),
    not: Boolean(groups.not),
    operator: groups.operator as BinaryOperator,
    value: deserializeValue(groups.value),
  };
};
