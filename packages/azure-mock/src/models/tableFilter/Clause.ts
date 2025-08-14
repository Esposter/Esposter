import type { BinaryOperator } from "@esposter/shared";

export interface Clause {
  key: string;
  operator: BinaryOperator;
  value: string;
}
