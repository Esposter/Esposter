import { BLOB_SEGMENT_MAX_LENGTH, BLOB_SEGMENT_REGEX, selectResourceSchema } from "@esposter/db-schema";
import { z } from "zod";

export const deleteFileInputSchema = z.object({
  // The client recovers this from the stable asset url, so it is always the single `{id}|{filename}` segment
  // `getBlobName` emits — a separator or a `..` could only ever be an attempt to climb out of {id}/files/
  blobPath: z.string().min(1).max(BLOB_SEGMENT_MAX_LENGTH).regex(BLOB_SEGMENT_REGEX),
  id: selectResourceSchema.shape.id,
});
export type DeleteFileInput = z.infer<typeof deleteFileInputSchema>;
