import { z } from "zod";
// What the model reads from a file attached to a prompt: an image, a PDF, or any file whose bytes are text
export enum AttachmentMediaType {
  Gif = "image/gif",
  Jpeg = "image/jpeg",
  Pdf = "application/pdf",
  Png = "image/png",
  Text = "text/plain",
  Webp = "image/webp",
}

export const attachmentMediaTypeSchema: z.ZodEnum<typeof AttachmentMediaType> = z.enum(
  AttachmentMediaType,
) satisfies z.ZodType<AttachmentMediaType>;
