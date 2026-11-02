import type { Point } from "#src/models/Point";
import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { JsonPatchOperation } from "@esposter/shared";

import { ArrowEndKey } from "#src/models/ArrowEndKey";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { getElementBounds } from "#src/services/getElementBounds";
import { getElementPointer } from "#src/services/getElementPointer";
import { getPositionedElement } from "#src/services/getPositionedElement";
import { getRerouteOperations } from "#src/services/getRerouteOperations";
import { exhaustiveGuard, JsonPatchOperationType } from "@esposter/shared";

// Moves the element at an index by the offset from its bounds' start to a point. A shape moves to the point and reroutes each arrow bound
// To it in the same edit. A stroke moves every point. An arrow moves each free end, since a bound end follows its shape, so an arrow bound at both ends is refused
export const movePositionedElement = (
  document: PositionedDocument,
  index: number,
  point: Point,
): JsonPatchOperation[] => {
  const element = getPositionedElement(document, index);
  if (!element) return [];

  const pointer = getElementPointer(index);
  const { x, y } = getElementBounds(element);
  const delta: Point = { x: point.x - x, y: point.y - y };
  const translate = (translatedPoint: Point): Point => ({
    x: translatedPoint.x + delta.x,
    y: translatedPoint.y + delta.y,
  });
  switch (element.type) {
    case PositionedElementType.Arrow: {
      const freeEndKeys = [ArrowEndKey.Start, ArrowEndKey.End].filter(
        (arrowEndKey) => element[arrowEndKey].binding === undefined,
      );
      return freeEndKeys.map((arrowEndKey) => ({
        op: JsonPatchOperationType.Replace,
        path: `${pointer}/${arrowEndKey}/point`,
        value: translate(element[arrowEndKey].point),
      }));
    }
    case PositionedElementType.Image:
    case PositionedElementType.Shape:
    case PositionedElementType.StickyNote:
    case PositionedElementType.Text: {
      const operations: JsonPatchOperation[] = [
        { op: JsonPatchOperationType.Replace, path: `${pointer}/x`, value: point.x },
        { op: JsonPatchOperationType.Replace, path: `${pointer}/y`, value: point.y },
      ];
      return element.type === PositionedElementType.Shape
        ? [...operations, ...getRerouteOperations(document.elements, { ...element, x: point.x, y: point.y })]
        : operations;
    }
    case PositionedElementType.Stroke:
      return [
        {
          op: JsonPatchOperationType.Replace,
          path: `${pointer}/points`,
          value: element.points.map((strokePoint) => translate(strokePoint)),
        },
      ];
    default:
      return exhaustiveGuard(element);
  }
};
