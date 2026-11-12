import type { JsonPatchOperation } from "@esposter/shared";
import type { ArrowBinding, ArrowEnd, Point, PositionedDocument, ShapeElement } from "vue-block-editor-headless";

import { createWhiteboardElement } from "@/services/whiteboard/createWhiteboardElement";
import { getArrowOperations } from "@/services/whiteboard/gesture/getArrowOperations";
import { getNearestConnectionPointIndex } from "@/services/whiteboard/gesture/getNearestConnectionPointIndex";
import { getPlacedBounds } from "@/services/whiteboard/getPlacedBounds";
import { WHITEBOARD_DEFAULT_ARROWHEAD } from "@/services/whiteboard/palette/constants";
import { applyPatches } from "@esposter/shared";
import {
  getConnectionPoint,
  getElementBounds,
  insertPositionedElement,
  PositionedElementType,
} from "vue-block-editor-headless";

// The operations a connection handle's release makes, as one list so one undo removes what they add together. A release on another shape joins the
// Arrow alone, from the handle's connection point to the connection point of that shape nearest the release. A release on empty canvas inserts a
// Shape of the source's kind centred on the release, at the default size and fill a placed shape takes, and joins the arrow to the connection point
// Of that shape nearest the source's handle
export const getConnectOperations = (
  document: PositionedDocument,
  source: ShapeElement,
  connectionIndex: number,
  options: { arrowId: string; release: Point; shapeId: string; target?: ArrowBinding },
): JsonPatchOperation[] => {
  const { arrowId, release, shapeId, target } = options;
  // The arrow leaves the source and points at the joined shape, so only its end takes an arrowhead, as an arrow drawn by the tool does
  const start: ArrowEnd = {
    binding: { connectionPointIndex: connectionIndex, elementId: source.id },
    point: getConnectionPoint(getElementBounds(source), connectionIndex),
  };

  if (target !== undefined) {
    const targetShape = document.elements.find(({ id }) => id === target.elementId);
    if (targetShape?.type !== PositionedElementType.Shape) return [];

    const targetBounds = getElementBounds(targetShape);
    const end: ArrowEnd = {
      arrowhead: WHITEBOARD_DEFAULT_ARROWHEAD,
      binding: target,
      point: getConnectionPoint(targetBounds, target.connectionPointIndex),
    };
    return getArrowOperations(document, arrowId, start, end);
  }

  const placement = { kind: source.kind, type: PositionedElementType.Shape } as const;
  const shape = createWhiteboardElement(placement, shapeId, getPlacedBounds(placement, release));
  const shapeOperations = insertPositionedElement(document, document.elements.length, shape);
  const shapeBounds = getElementBounds(shape);
  const shapeConnectionIndex = getNearestConnectionPointIndex(shapeBounds, start.point);
  const end: ArrowEnd = {
    arrowhead: WHITEBOARD_DEFAULT_ARROWHEAD,
    binding: { connectionPointIndex: shapeConnectionIndex, elementId: shapeId },
    point: getConnectionPoint(shapeBounds, shapeConnectionIndex),
  };
  const chainedDocument = applyPatches(document, shapeOperations).document;
  return [...shapeOperations, ...getArrowOperations(chainedDocument, arrowId, start, end)];
};
