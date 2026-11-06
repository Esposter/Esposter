import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { selectResourceInResourceSchema } from "@esposter/db-schema";
import { pointSchema } from "vue-block-editor-headless";
import { z } from "zod";

export const moveWhiteboardElementInputSchema = z.object({
  ...resourceIdInputSchema.shape,
  // The version the move was made against; left out, it applies to the latest content
  contentVersion: selectResourceInResourceSchema.shape.contentVersion.optional(),
  index: z
    .int()
    .nonnegative()
    .meta({ description: "The element's index in the whiteboard's element list, which is its place in the z-order" }),
  point: pointSchema.meta({ description: "The point the element moves to, in document units" }),
});
export type MoveWhiteboardElementInput = z.infer<typeof moveWhiteboardElementInputSchema>;
