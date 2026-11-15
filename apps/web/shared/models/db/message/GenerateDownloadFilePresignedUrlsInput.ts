import { fileEntitySchema, roomIdSchema } from "@esposter/db-schema";
import { createUniqueArraySchema, MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const generateDownloadFilePresignedUrlsInputSchema = z.object({
  files: createUniqueArraySchema(fileEntitySchema.pick({ filename: true, id: true, mimetype: true }), "id")
    .min(1)
    .max(MAX_READ_LIMIT),
  ...roomIdSchema.shape,
});
export type GenerateDownloadFilePresignedUrlsInput = z.infer<typeof generateDownloadFilePresignedUrlsInputSchema>;
