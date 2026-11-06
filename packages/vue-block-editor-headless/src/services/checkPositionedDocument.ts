import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { z } from "zod";

import { checkPositionedBindings } from "#src/services/checkPositionedBindings";
import { checkPositionedElementIds } from "#src/services/checkPositionedElementIds";

// The refinement a document's parsed elements run through: ids unique, and every arrow end's binding checked
export const checkPositionedDocument = (document: PositionedDocument, context: z.RefinementCtx): void => {
  checkPositionedElementIds(context, document.elements);
  checkPositionedBindings(context, document.elements);
};
