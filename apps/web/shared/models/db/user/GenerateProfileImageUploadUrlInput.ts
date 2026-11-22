import { fileEntitySchema } from "@esposter/db-schema";

// The mimetype is signed into the presigned write url, and the size is checked early, which the presigned url itself
// Cannot enforce
export const generateProfileImageUploadUrlInputSchema = fileEntitySchema.pick({ mimetype: true, size: true });
