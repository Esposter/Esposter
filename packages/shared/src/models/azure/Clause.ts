import type { BinaryOperator } from "@/models/azure/BinaryOperator";
import type { SearchOperator } from "@/models/azure/SearchOperator";
import type { SerializableValue } from "@/models/azure/SerializableValue";

export type Clause = {
  key: string;
  not?: boolean;
} & (
  | {
      operator: BinaryOperator;
      value: SerializableValue;
    }
  | {
      operator: Exclude<SearchOperator, SearchOperator.arrayContains>;
      value: SerializableValue;
    }
  | {
      operator: SearchOperator.arrayContains;
      value: SerializableValue[];
    }
);
