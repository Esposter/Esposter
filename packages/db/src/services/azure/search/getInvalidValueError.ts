import type { SerializableValue } from "@esposter/azure";

import { serializeValue } from "@esposter/azure";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every picker writes the shape its own filter type declares, so a value of another shape is a bug in the picker
// Rather than something the user typed
export const getInvalidValueError = (name: string, value: SerializableValue) =>
  new InvalidOperationError(Operation.Read, name, serializeValue(value));
