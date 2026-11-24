import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { MAX_UNRECONCILED_STORAGE_LEDGER_ENTRIES } from "#shared/services/storage/constants";
import { fileEntitySchema, selectResourceInResourceSchema } from "@esposter/db-schema";
import { ASSET_HASH_REGEX, createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export const generateUploadFilePresignedUrlEntitiesInputSchema = z.object({
  // `size` is what the storage quota reserves against, so it is bounded at the input boundary rather than trusted.
  // A negative or non-finite declaration would decrement the counter and bypass the quota entirely.
  // It is the client's own claim: a presigned write url carries no length constraint.
  // So the object-create notification is what replaces it with the stored object's real size.
  // The array is bounded by the in-flight hold cap rather than the generic read limit.
  // A batch above the cap can never pass the reserve however long the client waits.
  // `hash` is the address the file is stored under, and it is unique within the batch.
  // Two identical files reserve one object between them.
  // See openspec/specs/resource/storage-quotas/design.md
  files: createUniqueArraySchema(
    z.object({
      ...fileEntitySchema.pick({ mimetype: true }).shape,
      hash: z.string().regex(ASSET_HASH_REGEX),
      size: fileEntitySchema.shape.size.max(MAX_FILE_REQUEST_SIZE),
    }),
    "hash",
  )
    .min(1)
    .max(MAX_UNRECONCILED_STORAGE_LEDGER_ENTRIES),
  id: selectResourceInResourceSchema.shape.id,
});
export type GenerateUploadFilePresignedUrlEntitiesInput = z.infer<
  typeof generateUploadFilePresignedUrlEntitiesInputSchema
>;
