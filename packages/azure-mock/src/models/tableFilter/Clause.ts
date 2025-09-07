import type { BinaryOperator } from "@esposter/shared";

export interface Clause {
  key: string;
  not?: boolean;
  operator: BinaryOperator;
  value: string;
}
