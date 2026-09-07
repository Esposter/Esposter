import { fileEntitySchema, roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const generateUploadRoomEmojiSasEntityInputSchema = z.object({
  ...roomIdSchema.shape,
  // One blob per emoji, named by the id minted here — there is no filename in the blob name, so none is sent.
  // The mimetype is signed into the write SAS as the blob's content type, which is what stops the PUT storing
  // Anything but the image kind it declared
  ...fileEntitySchema.pick({ mimetype: true, size: true }).shape,
});
export type GenerateUploadRoomEmojiSasEntityInput = z.infer<typeof generateUploadRoomEmojiSasEntityInputSchema>;
