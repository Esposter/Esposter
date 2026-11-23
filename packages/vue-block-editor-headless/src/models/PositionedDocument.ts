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
// PositionedElementType is the same declaration on both sides (PositionedElement.ts names it in every element schema);
// The rule flags a zod object
// oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- nested in an array even on an exact enum match
export const positionedDocumentSchema: z.ZodType<PositionedDocument> = z
  .object({ elements: z.array(positionedElementSchema) })
  .superRefine(checkPositionedDocument, {
    when: ({ issues }) => issues.length === 0,
  }) satisfies z.ZodType<PositionedDocument>;
