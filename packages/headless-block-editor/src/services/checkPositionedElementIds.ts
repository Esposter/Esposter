import type { PositionedElement } from "#src/models/PositionedElement";
import type { z } from "zod";

// Refuses an element whose id an earlier element holds, since a binding names its shape by id
export const checkPositionedElementIds = (context: z.RefinementCtx, elements: PositionedElement[]): void => {
  const ids = new Set<string>();
  for (const [index, element] of elements.entries())
    if (ids.has(element.id))
      context.addIssue({ code: "custom", message: "repeats an id", path: ["elements", index, "id"] });
    else ids.add(element.id);
};
