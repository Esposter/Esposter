import { fileEntitySchema, roomIdSchema } from "@esposter/db-schema";
import { createUniqueArraySchema, MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const deleteUploadFilesInputSchema = z.object({
  files: createUniqueArraySchema(
    z.object({
      ...fileEntitySchema.pick({ filename: true, id: true }).shape,
      // The grant this member was handed when the write SAS was minted — see createUploadFileToken
      token: z.string().min(1),
    }),
    "id",
  )
    .min(1)
    .max(MAX_READ_LIMIT),
  ...roomIdSchema.shape,
});
export type DeleteUploadFilesInput = z.infer<typeof deleteUploadFilesInputSchema>;
