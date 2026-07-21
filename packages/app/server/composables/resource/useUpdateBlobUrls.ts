import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useBlobUrlSearchRegex } from "@@/server/composables/resource/useBlobUrlSearchRegex";
import { extractBlobUrls } from "@@/server/services/resource/extractBlobUrls";
import { getBlobUrlWithoutSasQuery } from "@@/server/services/resource/getBlobUrlWithoutSasQuery";
import { generateReadSasUrl, getBlobNameFromUrl } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { lookup } from "mime-types";
import { extname } from "node:path";

export const useUpdateBlobUrls = async (serializedContent: string, publishedDirectoryName?: string) => {
  const blobUrls = extractBlobUrls(serializedContent);
  if (blobUrls.length === 0) return serializedContent;

  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  // A url whose percent escapes are invalid yields no blob name, so it is left exactly as the content carries
  // It — one hand-written url can never fail the save or publish of every other asset in the same document
  const blobEntries = blobUrls.flatMap((blobUrl) => {
    const blobName = getBlobNameFromUrl(blobUrl, `${containerClient.url}/`);
    if (blobName === undefined) return [];
    // Published snapshots serve the assets cloned under the publish directory, not the mutable working copies
    else
      return [
        {
          blobName: publishedDirectoryName
            ? `${publishedDirectoryName}/${blobName.slice(blobName.indexOf("/") + 1)}`
            : blobName,
          blobUrl,
        },
      ];
  });
  const updatedBlobUrls = await Promise.all(
    blobEntries.map(({ blobName }) => {
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const extension = extname(blobName).toLowerCase();
      return generateReadSasUrl(blockBlobClient, { contentType: lookup(extension) || undefined });
    }),
  );
  const updatedBlobUrlMap = new Map(blobEntries.map(({ blobUrl }, i) => [blobUrl, takeOne(updatedBlobUrls, i)]));
  // One pass rewrites every url the same matcher found, so a url that is a prefix of another can never consume
  // It, and the cost stays independent of how many assets the document embeds
  return serializedContent.replaceAll(
    useBlobUrlSearchRegex(),
    (blobUrl) => updatedBlobUrlMap.get(getBlobUrlWithoutSasQuery(blobUrl)) ?? blobUrl,
  );
};
