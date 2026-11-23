import { fileEntitySchema, roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

// The mimetype is signed into the presigned write url, and the size is the early no the presigned url itself cannot
// Enforce
export const generateRoomProfileImageUploadUrlInputSchema = z.object({
  ...roomIdSchema.shape,
  ...fileEntitySchema.pick({ mimetype: true, size: true }).shape,
});
