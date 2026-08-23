import type { BinaryOperator } from "@/models/BinaryOperator";
import type { SearchOperator } from "@/models/search/SearchOperator";
import type { SerializableValue } from "@/models/SerializableValue";

export type Clause<T extends object> = {
  key: keyof T & string;
  not?: boolean;
} & (
  | {
      operator: BinaryOperator;
      value: SerializableValue;
    }
  | {
      operator: SearchOperator.arrayAny;
    }
  | {
      operator: SearchOperator.arrayContains;
      value: SerializableValue[];
    }
);
