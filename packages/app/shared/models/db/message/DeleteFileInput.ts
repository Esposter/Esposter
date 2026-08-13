import { messageCompositeKeySchema } from "#shared/models/db/message/MessageCompositeKey";
import { fileEntitySchema } from "@esposter/db-schema";
import { z } from "zod";

export const deleteFileInputSchema = z.object({
  ...messageCompositeKeySchema.shape,
  id: fileEntitySchema.shape.id,
});
export type DeleteFileInput = z.infer<typeof deleteFileInputSchema>;
