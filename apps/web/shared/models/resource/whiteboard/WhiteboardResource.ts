import type { WhiteboardElement } from "#shared/models/resource/whiteboard/WhiteboardElement";

import { whiteboardElementSchema } from "#shared/models/resource/whiteboard/WhiteboardElement";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { checkPositionedDocument } from "headless-block-editor";
import { z } from "zod";

// A whiteboard's elements in the order of the list, the first drawn beneath the rest
export interface WhiteboardResource {
  elements: WhiteboardElement[];
}

// Each element parses by its own schema, then the core's refinement runs over the parsed list
// The refinement runs only on a parse that raised no issue, so the elements it walks are typed
// oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- PositionedElementType is the same declaration on both sides (whiteboardElementSchema names it through the core's element schemas); the rule flags a zod object nested in an array even on an exact enum match
export const whiteboardResourceSchema = z
  .object({ elements: z.array(whiteboardElementSchema).max(MAX_RESOURCE_CONTENT_SIZE) })
  .superRefine(checkPositionedDocument, {
    when: ({ issues }) => issues.length === 0,
  }) satisfies z.ZodType<WhiteboardResource>;
