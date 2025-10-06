import type { Clause } from "@/models/azure/Clause";

import { BinaryOperator } from "@/models/azure/BinaryOperator";
import { NotFoundError } from "@/models/error/NotFoundError";
import { CLAUSE_REGEX } from "@/services/azure/constants";
import { deserializeValue } from "@/services/azure/deserializeValue";

export const deserializeClause = (string: string): Extract<Clause, { operator: BinaryOperator }> => {
  const match = CLAUSE_REGEX.exec(string.trim());
  if (!match) throw new NotFoundError(deserializeClause.name, string);
  const groups = match.groups as Record<keyof Clause, string> | undefined;
  if (!groups) throw new NotFoundError(deserializeClause.name, string);
  return {
    ...groups,
    not: Boolean(groups.not),
    operator: groups.operator as BinaryOperator,
    value: deserializeValue(groups.value),
  };
};
