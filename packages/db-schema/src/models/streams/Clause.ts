import type { BinaryOperator } from "#src/models/streams/BinaryOperator";
import type { SerializableValue } from "#src/models/streams/SerializableValue";

// One condition on a row, in the shape a read is narrowed by. A null value is an `is null` test, and `not` negates it
export type Clause<T extends object> = {
  key: keyof T & string;
  not?: boolean;
  operator: BinaryOperator;
  value: SerializableValue;
};
