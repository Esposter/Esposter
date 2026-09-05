import type { ResourceAssetPath } from "#shared/models/resource/ResourceAssetPath";
import type { ContainerClient } from "@azure/storage-blob";
import type { Database } from "@esposter/db-schema";

import {
  FILES_DIRECTORY_SEGMENT,
  RESOURCE_ASSET_URL_REGEX,
  RESOURCE_ASSETS_URL_PREFIX,
} from "#shared/services/resource/constants";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { parseResourceAssetPath } from "#shared/services/resource/parseResourceAssetPath";
import { deepReplaceStrings } from "#shared/util/object/deepReplaceStrings";
import { deepVisitStrings } from "#shared/util/object/deepVisitStrings";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { checkIsResourceAssetReadable } from "@@/server/services/resource/checkIsResourceAssetReadable";
import { emitStorageUsage } from "@@/server/services/storage/emitStorageUsage";
import { chargeStorageLedgerEntry, copyBlob, releaseStorageLedgerEntries } from "@esposter/db";
import { AzureContainer, MAX_CONCURRENT_BLOB_COPIES } from "@esposter/db-schema";
import { getOrCreate, getResultAsync, ID_SEPARATOR, noop, settleAll } from "@esposter/shared";

// The rewrite entry for one working-copy asset url, or nothing when the blob is missing — a reference the
// Clone cannot follow is data, carried verbatim rather than failing the whole clone
const cloneAsset = async (
  db: Database,
  userId: string,
  containerClient: ContainerClient,
  url: string,
  blobName: string,
  destinationBlobName: string,
): Promise<(readonly [string, string])[]> => {
  // One HEAD answers both questions the copy needs: that the source is there, and what the clone costs its new
  // Owner. Any failure reads as missing, like every other reference the clone cannot follow
  const contentLength = await getResultAsync(() => containerClient.getBlockBlobClient(blobName).getProperties()).match(
    (properties) => properties.contentLength,
    () => undefined,
  );
  if (contentLength === undefined) return [];

  // A clone is stored bytes like any other, charged to whoever the clone is for. The source's length is
  // Provisional: the copy raises its own `BlobCreated`, which finds this row and replaces the figure with what
  // Landed, so a source overwritten mid-copy costs seconds of a wrong number rather than a second HEAD on every
  // Clone (/docs/platform/storage-quotas). Charged before the copy, never after: Event Grid orders nothing, and
  // An event arriving before the row exists is dropped for good — `reconcileStorageLedgerEntry` reads a blob
  // Nothing reserved as unaccounted rather than as an error, so nothing retries the provisional figure away
  await chargeStorageLedgerEntry(db, userId, AzureContainer.ResourceAssets, destinationBlobName, contentLength);
  // The charge is a claim about a blob, so it unwinds the moment the blob turns out not to exist: a destination
  // Name is minted per clone and never written again, so no later event would correct the drift
  await getResultAsync(() => copyBlob(containerClient, blobName, destinationBlobName)).match(noop, async (error) => {
    await releaseStorageLedgerEntries(db, AzureContainer.ResourceAssets, [destinationBlobName]);
    throw error;
  });
  return [[url, getResourceAssetUrl(destinationBlobName)] as const];
};
// Publish, duplicate and restore snapshot content whose assets must survive the source's working copy changing:
// Every referenced asset is cloned into the destination's files directory under a new id and the content
// Rewritten to the clone's url. Only the filename carries over, so a foreign-id url clones correctly and no
// Clone lands under the destination's own published prefix, which unpublishing wipes
export const cloneContentAssets = async <TContent>(
  db: Database,
  userId: string,
  content: TContent,
  destinationDirectoryName: string,
): Promise<TContent> => {
  // An absolute url of ours is still ours, but the asset regex refuses it on purpose: the lookbehind is what
  // Keeps a foreign absolute url carrying our prefix from being rewritten into a local one. Only the origin
  // Tells the two apart, so same-origin urls are relativized rather than the anchor being loosened for both.
  // The app mints this form itself when it absolutizes for email, so exported html pasted back into an editor
  // Re-enters content with it, and left absolute the publish clones none of those assets and points anonymous
  // Viewers at the owner-only working copy. Read off the environment rather than through `useRuntimeConfig`:
  // This is a plain service, called from procedures and from tests that hold no Nuxt app
  const baseUrl = process.env.BASE_URL;
  const relativizedContent = baseUrl
    ? deepReplaceStrings(content, (value) =>
        value.replaceAll(
          `${baseUrl.replace(/\/$/u, "")}${RESOURCE_ASSETS_URL_PREFIX}/`,
          `${RESOURCE_ASSETS_URL_PREFIX}/`,
        ),
      )
    : content;
  const urls = new Set<string>();
  deepVisitStrings(relativizedContent, (value) => {
    for (const [url] of value.matchAll(RESOURCE_ASSET_URL_REGEX)) urls.add(url);
  });
  if (urls.size === 0) return relativizedContent;

  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  // Every clone takes a freshly minted asset id, never the source's. `restoreSnapshotVersion` clones back into
  // The working copy's own `{id}/files`, so a carried-over name would rebuild the exact name an editor delete
  // Already published for deletion — and a named-blob deletion event carries no time bound
  // (/docs/architecture/blob-lifecycle), so its replay destroys the restored blob. Minting also keeps a working
  // Copy and a published snapshot of the same file — content can embed both — from racing two copies onto one
  // Destination name.
  // Readability is a property of the resource, and content routinely names one resource's assets many times, so
  // The promise is cached — which also collapses the concurrent asks `Promise.all` issues before any of them
  // Lands. Cached as the two questions rather than as one answer keyed by the url's kind: ownership answers both
  // Kinds and is what the published branch falls through to, so a kind-keyed cache asked it twice per resource
  const isOwnedMap = new Map<string, Promise<boolean>>();
  const isPublishedReadableMap = new Map<string, Promise<boolean>>();
  const checkIsReadable = async ({ isPublished, resourceId }: ResourceAssetPath) => {
    if (
      await getOrCreate(isOwnedMap, resourceId, () =>
        checkIsResourceAssetReadable(db, { isPublished: false, resourceId }, userId),
      )
    )
      return true;
    if (!isPublished) return false;
    // Asked without the caller: ownership is what the published check falls through to, and it has already
    // Answered no for this resource
    return getOrCreate(isPublishedReadableMap, resourceId, () =>
      checkIsResourceAssetReadable(db, { isPublished: true, resourceId }),
    );
  };
  const clones = (
    await Promise.all(
      [...urls].map(async (url) => {
        const resourceAssetPath = parseResourceAssetPath(url.slice(`${RESOURCE_ASSETS_URL_PREFIX}/`.length));
        // A published url is cloned like any other: it names another publication's directory, which that
        // Resource's next unpublish wipes wholesale, so carrying it verbatim would leave this snapshot's images
        // 404ing on an operation its own owner never performed
        if (!resourceAssetPath) return [];
        // Content may legitimately name a url this caller cannot read — a foreign working copy reached through a
        // Personalized export, say. Copying it would republish the blob the serving endpoint refuses them, under
        // A directory anyone can read
        if (!(await checkIsReadable(resourceAssetPath))) return [];
        const { blobName } = resourceAssetPath;
        const fileSegment = blobName.slice(blobName.lastIndexOf("/") + 1);
        const separatorIndex = fileSegment.indexOf(ID_SEPARATOR);
        const filename = separatorIndex === -1 ? fileSegment : fileSegment.slice(separatorIndex + 1);
        const destinationBlobName = `${destinationDirectoryName}/${FILES_DIRECTORY_SEGMENT}/${crypto.randomUUID()}${ID_SEPARATOR}${filename}`;
        return [{ blobName, destinationBlobName, url }];
      }),
    )
  ).flat();
  // Two storage round trips per asset, so content naming hundreds of them would open that many connections at
  // Once and be throttled into failing the whole publish — they go out in bounded waves instead. `settleAll`
  // Rather than `Promise.all`, because every caller rolls back by deleting the destination directory: a copy
  // Still in flight lands after that delete, under a directory nothing reaches again
  const clonedUrlEntries = await settleAll(
    clones.map(
      ({ blobName, destinationBlobName, url }) =>
        () =>
          cloneAsset(db, userId, containerClient, url, blobName, destinationBlobName),
    ),
    MAX_CONCURRENT_BLOB_COPIES,
  );

  const updatedUrlMap = new Map(clonedUrlEntries.flat());
  if (updatedUrlMap.size === 0) return relativizedContent;
  // One event for the whole clone rather than one per asset: the owner's meter sees a single publish, and only
  // The last of those events would say anything the one before it did not
  await emitStorageUsage(db, userId);
  return deepReplaceStrings(relativizedContent, (value) =>
    value.replaceAll(RESOURCE_ASSET_URL_REGEX, (url) => updatedUrlMap.get(url) ?? url),
  );
};
