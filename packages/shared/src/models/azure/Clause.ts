import type { BinaryOperator } from "@/models/azure/BinaryOperator";
import type { SearchOperator } from "@/models/azure/SearchOperator";

export type Clause = {
  key: string;
} & (
  | {
      not?: boolean;
      operator: BinaryOperator;
      value: string;
    }
  | {
      operator: SearchOperator.arrayContains;
      value: string[];
    }
);
