import { InvalidOperationError } from "#src/models/error/InvalidOperationError";
import { Operation } from "#src/models/shared/Operation";
import { parseArrayIndex } from "#src/services/jsonPatch/parseArrayIndex";
import { toJsonPointer } from "#src/services/jsonPatch/toJsonPointer";
import { checkIsPlainObject } from "#src/util/object/checkIsPlainObject";

// Copies only the containers on the way to the value at the segments, so the new document shares every untouched
// Subtree with the old one and an object nothing changed keeps its identity
export const updateJsonValue = (
  document: unknown,
  segments: string[],
  update: (value: unknown) => unknown,
): unknown => {
  const [segment, ...restSegments] = segments;
  if (segment === undefined) return update(document);

  const index = Array.isArray(document) ? parseArrayIndex(segment, document.length - 1) : undefined;
  if (Array.isArray(document) && index !== undefined)
    return document.with(index, updateJsonValue(document[index], restSegments, update));
  else if (checkIsPlainObject(document) && Object.hasOwn(document, segment))
    return { ...document, [segment]: updateJsonValue(document[segment], restSegments, update) };
  else throw new InvalidOperationError(Operation.Update, toJsonPointer(segments), "no such member");
};
