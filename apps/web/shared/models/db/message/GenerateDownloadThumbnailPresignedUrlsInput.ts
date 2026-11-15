import { fileEntitySchema, roomIdSchema } from "@esposter/db-schema";
import { createUniqueArraySchema, MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const generateDownloadThumbnailPresignedUrlsInputSchema = z.object({
  files: createUniqueArraySchema(fileEntitySchema.pick({ id: true }), "id")
    .min(1)
    .max(MAX_READ_LIMIT),
  ...roomIdSchema.shape,
});
export type GenerateDownloadThumbnailPresignedUrlsInput = z.infer<
  typeof generateDownloadThumbnailPresignedUrlsInputSchema
>;
