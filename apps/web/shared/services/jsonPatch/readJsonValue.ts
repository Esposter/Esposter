import { parseArrayIndex } from "#shared/services/jsonPatch/parseArrayIndex";
import { toJsonPointer } from "#shared/services/jsonPatch/toJsonPointer";
import { checkIsPlainObject, InvalidOperationError, Operation } from "@esposter/shared";

export const readJsonValue = (document: unknown, segments: string[]) => {
  let value = document;
  for (const segment of segments) {
    const index = Array.isArray(value) ? parseArrayIndex(segment, value.length - 1) : undefined;
    if (Array.isArray(value) && index !== undefined) value = value[index];
    else if (checkIsPlainObject(value) && Object.hasOwn(value, segment)) value = value[segment];
    else throw new InvalidOperationError(Operation.Read, toJsonPointer(segments), "no such member");
  }
  return value;
};
