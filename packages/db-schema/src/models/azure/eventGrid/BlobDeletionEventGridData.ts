import { AzureContainer } from "@/models/azure/container/AzureContainer";
import { MAX_BLOB_DELETION_EVENT_BLOB_NAMES } from "@/services/azure/eventGrid/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// Two ways to name what to delete. **Names** for a caller that already knows them — the blobs of one message,
// One file — which is most of them. **A prefix** for a caller whose set is unbounded: a room's whole attachment
// Directory can hold more blobs than a request has time to enumerate, let alone chunk into events, so the
// Prefix is published instead and the handler does the listing. That puts the walk where the retries and the
// Time budget are, rather than blocking a mutation's response on it.
export type BlobDeletionEventGridData = { containerName: AzureContainer } & (
  | { blobNames: string[]; prefix?: never }
  | { blobNames?: never; prefix: string }
);

export const blobDeletionEventGridDataSchema = z.union([
  z.object({
    blobNames: createUniqueArraySchema(z.string()).min(1).max(MAX_BLOB_DELETION_EVENT_BLOB_NAMES),
    containerName: z.enum(AzureContainer),
  }),
  z.object({
    containerName: z.enum(AzureContainer),
    prefix: z.string().min(1),
  }),
]) satisfies z.ZodType<BlobDeletionEventGridData>;
