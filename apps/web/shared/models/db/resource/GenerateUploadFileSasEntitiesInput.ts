import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { ASSET_HASH_REGEX } from "#shared/services/resource/constants";
import { MAX_UNRECONCILED_STORAGE_LEDGER_ENTRIES } from "#shared/services/storage/constants";
import { fileEntitySchema, selectResourceInResourceSchema } from "@esposter/db-schema";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export const generateUploadFileSasEntitiesInputSchema = z.object({
  // `size` is what the storage quota reserves against, so it is bounded at the input boundary rather than
  // Trusted: a negative or non-finite declaration would decrement the counter and bypass the quota entirely.
  // It is the client's own claim — an Azure write SAS carries no length constraint — so `BlobCreated` is what
  // Replaces it with the stored object's real size. The array is bounded by the in-flight hold cap rather than
  // The generic read limit: a batch above the cap can never pass the reserve however long the client waits.
  // `hash` is the address the file is stored under, and it is unique within the batch because two identical files
  // Reserve one object between them. See openspec/specs/resource/storage-quotas/design.md
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
export type GenerateUploadFileSasEntitiesInput = z.infer<typeof generateUploadFileSasEntitiesInputSchema>;
