import type { Bounds } from "#src/models/Bounds";
import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { JsonPatchOperation } from "@esposter/shared";

import { resizePositionedElement } from "#src/services/resizePositionedElement";

// Sets the box of the element at an index to the bounds, its start as well as its size
export const resizePositionedElementBounds = (
  document: PositionedDocument,
  index: number,
  bounds: Bounds,
): JsonPatchOperation[] =>
  resizePositionedElement(
    document,
    index,
    { height: bounds.height, width: bounds.width },
    { x: bounds.x, y: bounds.y },
  );
