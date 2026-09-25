import type { SearchOperator } from "#src/models/search/SearchOperator";
import type { BinaryOperator } from "#src/models/shared/BinaryOperator";
import type { SerializableValue } from "#src/models/shared/SerializableValue";

export type Clause<T extends object> = {
  key: keyof T & string;
  not?: boolean;
} & (
  | {
      operator: BinaryOperator;
      value: SerializableValue;
    }
  | {
      operator: SearchOperator.ArrayAny;
    }
  | {
      operator: SearchOperator.ArrayContains;
      value: SerializableValue[];
    }
);
