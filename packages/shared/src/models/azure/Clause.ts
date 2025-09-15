import type { BinaryOperator } from "@/models/azure/BinaryOperator";

export interface Clause {
  key: string;
  not?: boolean;
  operator: BinaryOperator;
  value: string;
}
