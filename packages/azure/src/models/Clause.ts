import type { BinaryOperator } from "#src/models/BinaryOperator.ts";
import type { SearchOperator } from "#src/models/search/SearchOperator.ts";
import type { SerializableValue } from "#src/models/SerializableValue.ts";

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
