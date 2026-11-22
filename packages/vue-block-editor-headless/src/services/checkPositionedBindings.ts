import type { PositionedElement } from "#src/models/PositionedElement";
import type { z } from "zod";

import { ArrowEndKey } from "#src/models/ArrowEndKey";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { checkIsSamePoint } from "#src/services/checkIsSamePoint";
import { getBindableShape } from "#src/services/getBindableShape";
import { getConnectionPoint } from "#src/services/getConnectionPoint";
import { getElementBounds } from "#src/services/getElementBounds";

// Refuses an arrow end whose binding names no connection point of a shape that can take it, and a bound end whose
// Point is not the connection point its binding names, the point being derived from the binding
export const checkPositionedBindings = (context: z.RefinementCtx, elements: PositionedElement[]): void => {
  for (const [index, element] of elements.entries()) {
    if (element.type !== PositionedElementType.Arrow) continue;
    for (const endKey of [ArrowEndKey.Start, ArrowEndKey.End]) {
      const { binding, point } = element[endKey];
      if (!binding) continue;
      const shape = getBindableShape(elements, binding);
      if (!shape)
        context.addIssue({
          code: "custom",
          message: "binds no connection point of a shape in the document",
          path: ["elements", index, endKey, "binding"],
        });
      else if (!checkIsSamePoint(point, getConnectionPoint(getElementBounds(shape), binding.connectionPointIndex)))
        context.addIssue({
          code: "custom",
          message: "sits off the connection point it binds",
          path: ["elements", index, endKey, "point"],
        });
    }
  }
};
