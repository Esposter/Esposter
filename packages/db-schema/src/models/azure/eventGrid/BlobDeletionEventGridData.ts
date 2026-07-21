import { AzureContainer } from "@/models/azure/container/AzureContainer";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export interface BlobDeletionEventGridData {
  blobNames: string[];
  containerName: AzureContainer;
}

export const blobDeletionEventGridDataSchema = z.object({
  blobNames: createUniqueArraySchema(z.string()).min(1),
  containerName: z.enum(AzureContainer),
}) satisfies z.ZodType<BlobDeletionEventGridData>;
