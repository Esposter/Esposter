import type { Point } from "#src/models/Point";
import type { JsonPatchOperation } from "@esposter/shared";

import { JsonPatchOperationType } from "@esposter/shared";

// The operations that set an element's x and y at its pointer
export const getPositionOperations = (pointer: string, point: Point): JsonPatchOperation[] => [
  { op: JsonPatchOperationType.Replace, path: `${pointer}/x`, value: point.x },
  { op: JsonPatchOperationType.Replace, path: `${pointer}/y`, value: point.y },
];
