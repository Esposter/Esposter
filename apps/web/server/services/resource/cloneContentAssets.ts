import type { ContainerClient } from "@azure/storage-blob";
import type { Database, ResourceInResource } from "@esposter/db-schema";

import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { checkIsResourceAssetReadable } from "#server/services/resource/checkIsResourceAssetReadable";
import { relativizeOwnAssetUrls } from "#server/services/resource/relativizeOwnAssetUrls";
import { emitStorageUsage } from "#server/services/storage/emitStorageUsage";
import { RESOURCE_ASSET_URL_REGEX, RESOURCE_ASSETS_URL_PREFIX } from "#shared/services/resource/constants";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { getResourceFileBlobName } from "#shared/services/resource/getResourceFileBlobName";
import { parseResourceAssetPath } from "#shared/services/resource/parseResourceAssetPath";
import { deepReplaceStrings } from "#shared/util/object/deepReplaceStrings";
import { deepVisitStrings } from "#shared/util/object/deepVisitStrings";
import { chargeStorageLedgerEntry, copyBlob, releaseStorageLedgerEntries } from "@esposter/db";
import { AzureContainer, MAX_CONCURRENT_BLOB_COPIES } from "@esposter/db-schema";
import { getResultAsync, noop, settleAll } from "@esposter/shared";

// Copies one asset to the destination under the same hash. A destination that already holds the hash is the same bytes,
// So nothing is copied or charged. Returns whether the destination now holds the asset: a source Azure cannot find reads as
// Missing, like every other reference the clone cannot follow
const cloneAsset = async (
  db: Database,
  userId: string,
  containerClient: ContainerClient,
  blobName: string,
  destinationBlobName: string,
): Promise<boolean> => {
  if (await containerClient.getBlobClient(destinationBlobName).exists()) return true;

  // One HEAD answers both questions the copy needs: that the source is there, and what the clone costs its new owner
  const contentLength = await getResultAsync(() => containerClient.getBlockBlobClient(blobName).getProperties()).match(
    (properties) => properties.contentLength,
    () => undefined,
  );
  if (contentLength === undefined) return false;

  // Charged before the copy, never after: Event Grid orders nothing, and an event arriving before the row exists is dropped
  // For good. The source's length is provisional, and the copy's own `BlobCreated` replaces it with the stored size
  await chargeStorageLedgerEntry(db, userId, AzureContainer.ResourceAssets, destinationBlobName, contentLength);
  // The charge is a claim about a blob, so it unwinds the moment the blob turns out not to exist
  await getResultAsync(() => copyBlob(containerClient, blobName, destinationBlobName)).match(noop, async (error) => {
    await releaseStorageLedgerEntries(db, AzureContainer.ResourceAssets, [destinationBlobName]);
    throw error;
  });
  return true;
};

// Duplicate's clone: every asset the content names that the caller can read is held by the destination resource under
// Its own hash, and the content is rewritten to the destination's url. A url the caller cannot read, or one that is not an
// Asset address, is carried verbatim, so a shared blueprint keeps rendering for whoever can already see its assets
export const cloneContentAssets = async <TContent>(
  db: Database,
  userId: string,
  content: TContent,
  destinationResourceId: ResourceInResource["id"],
): Promise<TContent> => {
  const relativizedContent = relativizeOwnAssetUrls(content);
  const urls = new Set<string>();
  deepVisitStrings(relativizedContent, (value) => {
    for (const [url] of value.matchAll(RESOURCE_ASSET_URL_REGEX)) urls.add(url);
  });
  if (urls.size === 0) return relativizedContent;

  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  const clonableAssets = (
    await Promise.all(
      Array.from(urls, async (url) => {
        const resourceAssetPath = parseResourceAssetPath(url.slice(`${RESOURCE_ASSETS_URL_PREFIX}/`.length));
        if (!resourceAssetPath || !(await checkIsResourceAssetReadable(db, resourceAssetPath, userId))) return [];
        return [
          {
            blobName: resourceAssetPath.blobName,
            destinationBlobName: getResourceFileBlobName(destinationResourceId, resourceAssetPath.hash),
            url,
          },
        ];
      }),
    )
  ).flat();
  // Bounded waves rather than `Promise.all`: content naming hundreds of assets would otherwise open that many connections
  // At once and be throttled into failing the whole duplicate. `settleAll` so a copy still in flight never lands after the
  // Caller has rolled the destination back
  const clonedUrlEntries = await settleAll(
    clonableAssets.map(
      ({ blobName, destinationBlobName, url }) =>
        async () =>
          (await cloneAsset(db, userId, containerClient, blobName, destinationBlobName))
            ? [[url, getResourceAssetUrl(destinationBlobName)] as const]
            : [],
    ),
    MAX_CONCURRENT_BLOB_COPIES,
  );

  const updatedUrlMap = new Map(clonedUrlEntries.flat());
  if (updatedUrlMap.size === 0) return relativizedContent;
  // One event for the whole clone rather than one per asset: the owner's meter sees a single duplicate
  await emitStorageUsage(db, userId);
  return deepReplaceStrings(relativizedContent, (value) =>
    value.replaceAll(RESOURCE_ASSET_URL_REGEX, (url) => updatedUrlMap.get(url) ?? url),
  );
};
