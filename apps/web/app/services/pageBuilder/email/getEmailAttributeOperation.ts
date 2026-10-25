import type { JsonPatchOperation } from "@esposter/shared";

import { JsonPatchOperationType } from "@esposter/shared";

// The operation that writes an email node's attribute prop. A cleared value removes the prop, so the cascade's value applies again
export const getEmailAttributeOperation = (pointer: string, attribute: string, value: string): JsonPatchOperation =>
  value === ""
    ? { op: JsonPatchOperationType.Remove, path: `${pointer}/props/${attribute}` }
    : { op: JsonPatchOperationType.Add, path: `${pointer}/props/${attribute}`, value };
