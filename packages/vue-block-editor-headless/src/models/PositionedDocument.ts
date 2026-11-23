import type { PositionedElement } from "#src/models/PositionedElement";

import { positionedElementSchema } from "#src/models/PositionedElement";
import { checkPositionedDocument } from "#src/services/checkPositionedDocument";
import { z } from "zod";

// A positioned document: its elements in the order of the list, the first drawn beneath the rest
export interface PositionedDocument {
  elements: PositionedElement[];
}

// The elements parse by their own schemas, then the document's refinement runs over the parsed list
// The refinement runs only on a parse that raised no issue, so the elements it walks are typed
export const positionedDocumentSchema: z.ZodType<PositionedDocument> = z
  .object({ elements: z.array(positionedElementSchema) })
  .superRefine(checkPositionedDocument, {
    when: ({ issues }) => issues.length === 0,
  }) satisfies z.ZodType<PositionedDocument>;
