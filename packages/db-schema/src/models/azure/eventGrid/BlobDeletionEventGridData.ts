import { AzureContainer } from "@/models/azure/container/AzureContainer";
import { MAX_BLOB_DELETION_EVENT_BLOB_NAMES } from "@/services/azure/eventGrid/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export interface BlobDeletionEventGridData {
  blobNames: string[];
  containerName: AzureContainer;
}

export const blobDeletionEventGridDataSchema = z.object({
  blobNames: createUniqueArraySchema(z.string()).min(1).max(MAX_BLOB_DELETION_EVENT_BLOB_NAMES),
  containerName: z.enum(AzureContainer),
}) satisfies z.ZodType<BlobDeletionEventGridData>;
