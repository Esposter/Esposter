import { fileEntitySchema, roomIdSchema } from "@esposter/db-schema";
import { MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const generateUploadFileSasEntitiesInputSchema = z.object({
  // Deliberately not a unique array: every write target is minted under its own fresh id (see getFileBlobNames),
  // So two files a user genuinely named the same collide nowhere, and rejecting the drop over the shared name
  // Would fail the whole selection for something the storage layout already keeps apart. The sibling delete and
  // Download schemas key on the id because by then the id exists; here the client has no id to send yet.
  files: fileEntitySchema.pick({ filename: true, mimetype: true, size: true }).array().min(1).max(MAX_READ_LIMIT),
  ...roomIdSchema.shape,
});
export type GenerateUploadFileSasEntitiesInput = z.infer<typeof generateUploadFileSasEntitiesInputSchema>;
