import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { selectResourceSchema } from "@esposter/db-schema";
import { z } from "zod";

export const generateUploadContentSasUrlInputSchema = z.object({
  id: selectResourceSchema.shape.id,
  // The gzip's byte length, which the quota holds against. Bounded here for the reason every declared size is —
  // A negative or non-finite one would shrink the pending sum — and by the content limit because the gzip of a
  // Document under it is smaller still. The commit measures the real bytes (/docs/resource/storage-quotas)
  size: z.int().positive().max(MAX_RESOURCE_CONTENT_SIZE),
});
export type GenerateUploadContentSasUrlInput = z.infer<typeof generateUploadContentSasUrlInputSchema>;
