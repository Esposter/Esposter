import { fileEntitySchema } from "@esposter/db-schema";

// The mimetype is signed into the presigned write url, and the size is the early no the presigned url itself cannot enforce
export const generateProfileImageUploadUrlInputSchema = fileEntitySchema.pick({ mimetype: true, size: true });
