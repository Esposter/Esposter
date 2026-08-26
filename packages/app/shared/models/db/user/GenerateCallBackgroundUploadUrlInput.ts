import { fileEntitySchema } from "@esposter/db-schema";
import { z } from "zod";

export const generateCallBackgroundUploadUrlInputSchema = z.object({
  // No slot is sent: the free one is chosen server-side, so a client can never be handed a write target that
  // Overwrites a background it did not mean to replace. The mimetype is signed into the write SAS as the
  // Blob's content type, and the size is the early no the SAS itself cannot enforce
  ...fileEntitySchema.pick({ mimetype: true, size: true }).shape,
});
export type GenerateCallBackgroundUploadUrlInput = z.infer<typeof generateCallBackgroundUploadUrlInputSchema>;
