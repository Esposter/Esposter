import type { Clause } from "@/models/tableFilter/Clause";

import { CLAUSE_REGEX } from "@/util/tableFilter/constants";
import { NotFoundError } from "@esposter/shared";

export const parseClause = (rawClause: string): Clause => {
  const match = CLAUSE_REGEX.exec(rawClause.trim());
  if (!match) throw new NotFoundError(parseClause.name, rawClause);
  const groups = match.groups as undefined | { key: string; operator: string; value: string };
  if (!groups) throw new NotFoundError(parseClause.name, rawClause);
  const { key, operator, value } = groups;
  return {
    key,
    operator: operator as Clause["operator"],
    value,
  };
};
