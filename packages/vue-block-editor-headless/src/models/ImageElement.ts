import type { BoxElement } from "#src/models/BoxElement";
import type { ItemEntityType } from "@esposter/shared";

import { boxElementSchema } from "#src/models/BoxElement";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { z } from "zod";

// An image: a box that holds the content hash of an uploaded file, and none of the file's bytes, and the alt text that names it, which is empty when none is set
export interface ImageElement extends BoxElement, ItemEntityType<PositionedElementType.Image> {
  altText: string;
  fileId: string;
}

export const imageElementSchema: z.ZodObject<
  typeof boxElementSchema.shape & {
    altText: z.ZodString;
    fileId: z.ZodCustomStringFormat<"sha256_hex">;
    type: z.ZodLiteral<PositionedElementType.Image>;
  }
> = z.object({
  ...boxElementSchema.shape,
  altText: z.string(),
  fileId: z.hash("sha256"),
  type: z.literal(PositionedElementType.Image),
}) satisfies z.ZodType<ImageElement>;
