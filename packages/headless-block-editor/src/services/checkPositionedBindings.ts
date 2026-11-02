import type { PositionedElement } from "#src/models/PositionedElement";
import type { z } from "zod";

import { ArrowEndKey } from "#src/models/ArrowEndKey";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { getBindableShape } from "#src/services/getBindableShape";

// Refuses an arrow end whose binding names no shape of the document that can take it, the shape being missing, an annotation or without that point
export const checkPositionedBindings = (context: z.RefinementCtx, elements: PositionedElement[]): void => {
  for (const [index, element] of elements.entries()) {
    if (element.type !== PositionedElementType.Arrow) continue;
    for (const endKey of [ArrowEndKey.Start, ArrowEndKey.End]) {
      const binding = element[endKey].binding;
      if (binding && !getBindableShape(elements, binding))
        context.addIssue({
          code: "custom",
          message: "binds no connection point of a shape in the document",
          path: ["elements", index, endKey, "binding"],
        });
    }
  }
};
