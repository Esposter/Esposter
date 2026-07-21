import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useBlobUrlSearchRegex } from "@@/server/composables/resource/useBlobUrlSearchRegex";
import { getBlobUrlWithoutSasQuery } from "@@/server/services/resource/getBlobUrlWithoutSasQuery";
import { getContentBlobUrls } from "@@/server/services/resource/getContentBlobUrls";
import { generateReadSasUrl, getBlobNameFromUrl } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";
import { lookup } from "mime-types";
import { extname } from "node:path";
import { deepReplaceStrings } from "#shared/util/object/deepReplaceStrings";

export const useUpdateBlobUrls = async <TContent>(
  content: TContent,
  publishedDirectoryName?: string,
): Promise<TContent> => {
  const blobUrls = getContentBlobUrls(content);
  if (blobUrls.length === 0) return content;

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
  const updatedBlobUrlMap = new Map(
    await Promise.all(
      blobEntries.map(async ({ blobName, blobUrl }) => {
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const extension = extname(blobName).toLowerCase();
        const updatedBlobUrl = await generateReadSasUrl(blockBlobClient, {
          contentType: lookup(extension) || undefined,
        });
        return [blobUrl, updatedBlobUrl] as const;
      }),
    ),
  );
  // One pass per leaf rewrites every url the same matcher found, so a url that is a prefix of another can never
  // Consume it, and the cost stays independent of how many assets the document embeds
  return deepReplaceStrings(content, (value) =>
    value.replaceAll(
      useBlobUrlSearchRegex(),
      (blobUrl) => updatedBlobUrlMap.get(getBlobUrlWithoutSasQuery(blobUrl)) ?? blobUrl,
    ),
  );
};
