import { useContainerBaseUrl } from "@@/server/composables/azure/container/useContainerBaseUrl";
import { AzureContainer } from "@esposter/db-schema";
// Blob urls never contain quotes or backslashes, so stopping at either lets the regex match urls
// Embedded in raw html/css strings and in JSON-serialized content (where `\"` ends the string) alike
export const useBlobUrlSearchRegex = (blobUrl?: string) => {
  const containerBaseUrl = useContainerBaseUrl();
  return new RegExp(
    `${blobUrl ? RegExp.escape(blobUrl) : `${containerBaseUrl}/${AzureContainer.ResourceAssets}`}[^"\\\\]*`,
    "gu",
  );
};
