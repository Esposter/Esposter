import { fileEntitySchema, roomIdSchema } from "@esposter/db-schema";

// The mimetype is signed into the presigned write url, and the size is the early no the presigned url itself cannot enforce
export const generateRoomProfileImageUploadUrlInputSchema = roomIdSchema.extend(
  fileEntitySchema.pick({ mimetype: true, size: true }).shape,
);
