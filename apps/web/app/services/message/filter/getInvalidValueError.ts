import type { SerializableValue } from "@esposter/azure";

import { serializeValue } from "@esposter/azure";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every picker writes the shape its own filter type declares, so a value of any other shape is a bug in the
// Picker rather than something the user typed — it is refused rather than rendered as `[object Object]`
export const getInvalidValueError = (functionName: string, value: SerializableValue) =>
  new InvalidOperationError(Operation.Read, functionName, serializeValue(value));
