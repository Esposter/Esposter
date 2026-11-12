import type { Point } from "#src/models/Point";
import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { Size } from "#src/models/Size";
import type { JsonPatchOperation } from "@esposter/shared";

import { PositionedElementType } from "#src/models/PositionedElementType";
import { checkIsResizablePositionedElement } from "#src/services/checkIsResizablePositionedElement";
import { getElementPointer } from "#src/services/getElementPointer";
import { getPositionedElement } from "#src/services/getPositionedElement";
import { getPositionOperations } from "#src/services/getPositionOperations";
import { getRerouteOperations } from "#src/services/getRerouteOperations";
import { JsonPatchOperationType } from "@esposter/shared";

// Resizes the element at an index, and in the same edit reroutes each arrow bound to a resized shape, since its connection points move.
// A given position also moves the element's start in that edit. A text box stores no height, so only its width is set, and an auto width text box is wrapped again at the width it is set to. An arrow and a stroke hold no size of their own, so neither is resized
export const resizePositionedElement = (
  document: PositionedDocument,
  index: number,
  size: Size,
  position?: Point,
): JsonPatchOperation[] => {
  const element = getPositionedElement(document, index);
  if (!element || !checkIsResizablePositionedElement(element)) return [];

  const pointer = getElementPointer(index);
  const positionOperations = position ? getPositionOperations(pointer, position) : [];
  const widthOperation: JsonPatchOperation = {
    op: JsonPatchOperationType.Replace,
    path: `${pointer}/width`,
    value: size.width,
  };
  // A width handle on an auto width text box sets it back to a wrapped width, at the width the handle drags it to
  if (element.type === PositionedElementType.Text)
    return element.isWrapped
      ? [...positionOperations, widthOperation]
      : [
          ...positionOperations,
          widthOperation,
          { op: JsonPatchOperationType.Replace, path: `${pointer}/isWrapped`, value: true },
        ];

  const operations: JsonPatchOperation[] = [
    ...positionOperations,
    widthOperation,
    { op: JsonPatchOperationType.Replace, path: `${pointer}/height`, value: size.height },
  ];
  return element.type === PositionedElementType.Shape
    ? [
        ...operations,
        ...getRerouteOperations(document.elements, { ...element, ...position, height: size.height, width: size.width }),
      ]
    : operations;
};
