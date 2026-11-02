import type { ArrowBinding } from "#src/models/ArrowBinding";
import type { PositionedElement } from "#src/models/PositionedElement";
import type { ShapeElement } from "#src/models/ShapeElement";

import { PositionedElementType } from "#src/models/PositionedElementType";
import { ShapeKind } from "#src/models/ShapeKind";
import { CONNECTION_POINT_COUNT } from "#src/services/constants";

// The shape a binding names, when the shape can take it: a shape that is not an annotation, with a connection point index the shape has.
// Undefined for a binding that names nothing of the kind, so every other element refuses a binding
export const getBindableShape = (elements: PositionedElement[], binding: ArrowBinding): ShapeElement | undefined => {
  const element = elements.find(({ id }) => id === binding.elementId);
  const { connectionPointIndex } = binding;
  return element?.type === PositionedElementType.Shape &&
    element.kind !== ShapeKind.Annotation &&
    Number.isInteger(connectionPointIndex) &&
    connectionPointIndex >= 0 &&
    connectionPointIndex < CONNECTION_POINT_COUNT
    ? element
    : undefined;
};
