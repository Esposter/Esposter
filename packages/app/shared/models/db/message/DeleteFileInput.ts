import { fileEntitySchema, standardMessageEntitySchema } from "@esposter/db-schema";
import { z } from "zod";

export const deleteFileInputSchema = z.object({
  ...standardMessageEntitySchema.pick({ partitionKey: true, rowKey: true }).shape,
  id: fileEntitySchema.shape.id,
});
export type DeleteFileInput = z.infer<typeof deleteFileInputSchema>;
