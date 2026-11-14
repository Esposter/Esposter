import type { SerializableValue } from "#src/models/message/filter/SerializableValue";
import type { BinaryOperator } from "#src/models/shared/BinaryOperator";

// One condition on a row, in the shape a read is narrowed by. A null value is an `is null` test, and `not` negates it
export interface Clause<T extends object> {
  key: keyof T & string;
  not?: boolean;
  operator: BinaryOperator;
  value: SerializableValue;
}
