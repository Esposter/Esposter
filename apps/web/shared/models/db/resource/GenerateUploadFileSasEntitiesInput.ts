import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { MAX_UNRECONCILED_STORAGE_LEDGER_ENTRIES } from "#shared/services/storage/constants";
import { fileEntitySchema, selectResourceSchema } from "@esposter/db-schema";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export const generateUploadFileSasEntitiesInputSchema = z.object({
  // `size` is what the storage quota reserves against, so it is bounded at the input boundary rather than
  // Trusted: a negative or non-finite declaration would decrement the counter and bypass the quota entirely.
  // It is the client's own claim — an Azure write SAS carries no length constraint — so `BlobCreated` is what
  // Replaces it with the stored object's real size. The array is bounded by the in-flight hold cap rather than
  // The generic read limit: a batch above the cap can never pass the reserve however long the client waits.
  // See /docs/platform/storage-quotas
  files: createUniqueArraySchema(
    z.object({
      ...fileEntitySchema.pick({ filename: true, mimetype: true }).shape,
      size: fileEntitySchema.shape.size.max(MAX_FILE_REQUEST_SIZE),
    }),
    "filename",
  )
    .min(1)
    .max(MAX_UNRECONCILED_STORAGE_LEDGER_ENTRIES),
  id: selectResourceSchema.shape.id,
});
export type GenerateUploadFileSasEntitiesInput = z.infer<typeof generateUploadFileSasEntitiesInputSchema>;
