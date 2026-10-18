import { parseArrayIndex } from "#src/services/jsonPatch/parseArrayIndex";
import { toJsonPointer } from "#src/services/jsonPatch/toJsonPointer";
import { checkIsPlainObject } from "#src/util/object/checkIsPlainObject";
import { InvalidOperationError } from "#src/models/error/InvalidOperationError";
import { Operation } from "#src/models/shared/Operation";

export const readJsonValue = (document: unknown, segments: string[]): unknown => {
  let value = document;
  for (const segment of segments) {
    const index = Array.isArray(value) ? parseArrayIndex(segment, value.length - 1) : undefined;
    if (Array.isArray(value) && index !== undefined) value = value[index];
    else if (checkIsPlainObject(value) && Object.hasOwn(value, segment)) value = value[segment];
    else throw new InvalidOperationError(Operation.Read, toJsonPointer(segments), "no such member");
  }
  return value;
};
