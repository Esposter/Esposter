import type { Clause } from "@/models/azure/Clause";

import { UnaryOperator } from "@/models/azure/UnaryOperator";

export const serializeClause = ({ key, not, operator, value }: Clause) => {
  const notPrefix = not ? `${UnaryOperator.not} ` : "";
  return `${notPrefix}${key} ${operator} '${value}'`;
};
