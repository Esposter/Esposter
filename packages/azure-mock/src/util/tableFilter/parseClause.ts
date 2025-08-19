import type { Clause } from "@/models/tableFilter/Clause";
import type { BinaryOperator } from "@esposter/shared";

import { CLAUSE_REGEX } from "@/util/tableFilter/constants";
import { NotFoundError } from "@esposter/shared";

export const parseClause = (rawClause: string): Clause => {
  const match = CLAUSE_REGEX.exec(rawClause.trim());
  if (!match) throw new NotFoundError(parseClause.name, rawClause);
  const groups = match.groups as Record<keyof Clause, string> | undefined;
  if (!groups) throw new NotFoundError(parseClause.name, rawClause);
  const normalizedValue =
    groups.value.startsWith("'") && groups.value.endsWith("'") ? groups.value.slice(1, -1) : groups.value;
  return {
    ...groups,
    not: Boolean(groups.not),
    operator: groups.operator as BinaryOperator,
    value: normalizedValue,
  };
};
