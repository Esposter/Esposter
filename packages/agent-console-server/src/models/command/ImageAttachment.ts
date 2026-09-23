import type { ImageMediaType } from "#src/models/command/ImageMediaType";

import { imageMediaTypeSchema } from "#src/models/command/ImageMediaType";
import { z } from "zod";

export interface ImageAttachment {
  // Base64 without the data URL prefix, the shape an image content block carries
  data: string;
  mediaType: ImageMediaType;
}

export const imageAttachmentSchema: z.ZodObject<{ data: z.ZodBase64; mediaType: typeof imageMediaTypeSchema }> =
  z.object({
    data: z.base64(),
    mediaType: imageMediaTypeSchema,
  }) satisfies z.ZodType<ImageAttachment>;
