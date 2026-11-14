import { messageIdentityInputSchema } from "#shared/models/db/message/MessageIdentityInput";
import { fileEntitySchema } from "@esposter/db-schema";
import { z } from "zod";

export const deleteFileInputSchema = z.object({
  ...messageIdentityInputSchema.shape,
  fileId: fileEntitySchema.shape.id,
});
export type DeleteFileInput = z.infer<typeof deleteFileInputSchema>;
