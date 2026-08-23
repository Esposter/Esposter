import { AzureContainer } from "#src/models/azure/container/AzureContainer";
import { MAX_BLOB_DELETION_EVENT_BLOB_NAMES } from "#src/services/azure/eventGrid/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// Two ways to name what to delete. **Names** for a caller that already knows them — the blobs of one message,
// One file — which is most of them. **A prefix** for a caller whose set is unbounded: a room's whole attachment
// Directory can hold more blobs than a request has time to enumerate, let alone chunk into events, so the
// Prefix is published instead and the handler does the listing. That puts the walk where the retries and the
// Time budget are, rather than blocking a mutation's response on it.
export type BlobDeletionEventGridData = (
  | { blobNames: string[]; createdBefore?: never; prefix?: never }
  | { blobNames?: never; createdBefore?: Date; prefix: string }
) & {
  containerName: AzureContainer;
};

export const blobDeletionEventGridDataSchema = z.union([
  z.object({
    blobNames: createUniqueArraySchema(z.string()).min(1).max(MAX_BLOB_DELETION_EVENT_BLOB_NAMES),
    containerName: z.enum(AzureContainer),
  }),
  z.object({
    containerName: z.enum(AzureContainer),
    // The listing happens at delivery time, but the set the publisher meant is the one that existed when it
    // Published. Delivery is at-least-once and a dead-lettered event can be replayed hours later, so without
    // This bound a redelivery would enumerate — and delete — blobs written after the deletion was decided.
    // Omitted only where the prefix can never be re-owned (a deleted room): there is no later writer for a
    // Replay to destroy, and this is the sole sweep of that prefix, so a bound would strand every upload
    // Whose write SAS was still live when the owner deleted
    createdBefore: z.coerce.date().optional(),
    prefix: z.string().min(1),
  }),
]) satisfies z.ZodType<BlobDeletionEventGridData>;
