import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useBlobUrlSearchRegex } from "@@/server/composables/resource/useBlobUrlSearchRegex";
import { extractBlobUrls } from "@@/server/services/resource/extractBlobUrls";
import { generateReadSasUrl } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { lookup } from "mime-types";
import { extname } from "node:path";

export const useUpdateBlobUrls = async (serializedContent: string, publishedDirectoryName?: string) => {
  const blobUrls = extractBlobUrls(serializedContent);
  if (blobUrls.length === 0) return serializedContent;

  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  const blobNames = blobUrls.map((blobUrl) => {
    // The url is percent-encoded as the content carries it, so it can be searched for verbatim below —
    // A blob name is that url's decoded form
    const blobName = decodeURIComponent(blobUrl.slice(`${containerClient.url}/`.length));
    // Published snapshots serve the assets cloned under the publish directory, not the mutable working copies
    return publishedDirectoryName ? `${publishedDirectoryName}/${blobName.slice(blobName.indexOf("/") + 1)}` : blobName;
  });
  const updatedBlobUrls = await Promise.all(
    blobNames.map((blobName) => {
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const extension = extname(blobName).toLowerCase();
      return generateReadSasUrl(blockBlobClient, { contentType: lookup(extension) || undefined });
    }),
  );
  let updatedSerializedContent = serializedContent;

  for (const [i, blobUrl] of blobUrls.entries()) {
    const updatedBlobUrl = takeOne(updatedBlobUrls, i);
    updatedSerializedContent = updatedSerializedContent.replaceAll(useBlobUrlSearchRegex(blobUrl), updatedBlobUrl);
  }

  return updatedSerializedContent;
};
