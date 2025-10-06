import type { SearchOperator } from "@/models/azure/SearchOperator";

import { BinaryOperator } from "@/models/azure/BinaryOperator";

export const RangeOperators: (BinaryOperator | SearchOperator)[] = [
  BinaryOperator.ge,
  BinaryOperator.gt,
  BinaryOperator.le,
  BinaryOperator.lt,
];
// oxlint-disable-next-line typescript/no-inferrable-types
export const CLAUSE_REGEX: RegExp = new RegExp(
  `^(?<not>not\\s+)?(?<key>[A-Za-z0-9_]+)\\s+(?<operator>${Object.values(BinaryOperator).join("|")})\\s+(?<value>'[^']*'|${[null, Number.NaN].join("|")})$`,
  "i",
);
