import { BinaryOperator } from "@esposter/shared";
// oxlint-disable-next-line typescript/no-inferrable-types
export const CLAUSE_REGEX: RegExp = new RegExp(
  `^(?<not>not\\s+)?(?<key>[A-Za-z0-9_]+)\\s+(?<operator>${Object.values(BinaryOperator).join("|")})\\s+(?<value>'[^']*'|${[null, Number.NaN].join("|")})$`,
  "i",
);
