import type { BoxElement } from "#src/models/BoxElement";
import type { ItemEntityType } from "@esposter/shared";

import { boxElementSchema } from "#src/models/BoxElement";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { z } from "zod";

// An image: a box that holds the content hash of an uploaded file, and none of the file's bytes
export interface ImageElement extends BoxElement, ItemEntityType<PositionedElementType.Image> {
  fileId: string;
}

export const imageElementSchema: z.ZodObject<
  typeof boxElementSchema.shape & {
    fileId: z.ZodCustomStringFormat<"sha256_hex">;
    type: z.ZodLiteral<PositionedElementType.Image>;
  }
> = z.object({
  ...boxElementSchema.shape,
  fileId: z.hash("sha256"),
  type: z.literal(PositionedElementType.Image),
}) satisfies z.ZodType<ImageElement>;
