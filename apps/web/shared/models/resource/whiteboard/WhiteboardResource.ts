import type { PositionedElement } from "vue-block-editor-headless";

import { whiteboardElementSchema } from "#shared/models/resource/whiteboard/WhiteboardElement";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { checkPositionedDocument } from "vue-block-editor-headless";
import { z } from "zod";

// A whiteboard's elements in the order of the list, the first drawn beneath the rest
export interface WhiteboardResource {
  elements: PositionedElement[];
}
export const whiteboardResourceSchema = z
  .object({ elements: createUniqueArraySchema(whiteboardElementSchema, "id").max(MAX_RESOURCE_CONTENT_SIZE) })
  .superRefine(checkPositionedDocument, {
    when: ({ issues }) => issues.length === 0,
  }) satisfies z.ZodType<WhiteboardResource>;
