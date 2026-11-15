import { FILE_MAX_LENGTH, fileEntitySchema, roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const generateUploadFilePresignedUrlEntitiesInputSchema = z.object({
  // Deliberately not a unique array: every write target is minted under its own fresh id (see getFileBlobNames),
  // So two files a user genuinely named the same collide nowhere, and rejecting the drop over the shared name
  // Would fail the whole selection for something the storage layout already keeps apart. The sibling delete and
  // Download schemas key on the id because by then the id exists; here the client has no id to send yet. Bounded by
  // What one message attaches, so the reservations it makes stay inside the reserve's own cap
  files: fileEntitySchema.pick({ filename: true, mimetype: true, size: true }).array().min(1).max(FILE_MAX_LENGTH),
  ...roomIdSchema.shape,
});
export type GenerateUploadFilePresignedUrlEntitiesInput = z.infer<
  typeof generateUploadFilePresignedUrlEntitiesInputSchema
>;
