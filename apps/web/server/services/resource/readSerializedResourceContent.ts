import type { Resource } from "@esposter/db-schema";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { getContentBlobName, readJsonBlob } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";

// The working copy as the JSON it was serialized to, undefined for a resource created and never saved
export const readSerializedResourceContent = async (id: Resource["id"]): Promise<string | undefined> => {
  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  const serializedContent = await readJsonBlob(containerClient, getContentBlobName(id));
  return serializedContent?.toString();
};
