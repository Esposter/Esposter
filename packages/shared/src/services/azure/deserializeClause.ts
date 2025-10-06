import type { Clause } from "@/models/azure/Clause";

import { BinaryOperator } from "@/models/azure/BinaryOperator";
import { NotFoundError } from "@/models/error/NotFoundError";
import { CLAUSE_REGEX } from "@/services/azure/constants";
import { deserializeValue } from "@/services/azure/deserializeValue";
import { deserializeKey } from "@/services/azure/table/deserializeKey";

export const deserializeClause = (string: string): Extract<Clause, { operator: BinaryOperator }> => {
  const trimmedString = string.trim();
  const match = CLAUSE_REGEX.exec(trimmedString);
  if (!match) throw new NotFoundError(deserializeClause.name, trimmedString);
  const groups = match.groups as Record<keyof Clause, string> | undefined;
  if (!groups) throw new NotFoundError(deserializeClause.name, trimmedString);
  return {
    key: deserializeKey(groups.key),
    not: Boolean(groups.not),
    operator: groups.operator as BinaryOperator,
    value: deserializeValue(groups.value),
  };
};
