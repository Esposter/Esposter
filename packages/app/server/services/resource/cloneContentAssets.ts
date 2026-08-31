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

// The rewrite entry for one working-copy asset url, or nothing when the referenced blob is missing — a
// Dangling reference (the asset was deleted but the content still embeds its url) is data like an
// Unparseable url, carried verbatim instead of failing the whole clone
const cloneAsset = async (
  db: Database,
  userId: string,
  containerClient: ContainerClient,
  url: string,
  blobName: string,
  destinationBlobName: string,
): Promise<(readonly [string, string])[]> => {
  // The properties answer both questions the copy needs — whether the source is there, and how many bytes the
  // Clone will cost its new owner — in the one HEAD an existence check already paid for. Any failure reads as
  // Missing, which is what an unfollowable reference has always degraded to here
  const contentLength = await getResultAsync(() => containerClient.getBlockBlobClient(blobName).getProperties()).match(
    (properties) => properties.contentLength,
    () => undefined,
  );
  if (contentLength === undefined) return [];

  // A clone is stored bytes like any other, and the destination directory belongs to whoever this clone is
  // For — the publisher, or the owner of the duplicate or the restored working copy. The source's length is a
  // Provisional figure, not a measurement of the copy: the copy raises its own `BlobCreated`, which finds the
  // Row this charge wrote and replaces the figure with what actually landed. So a source overwritten under a
  // Still-valid write SAS between the read and the copy costs a few seconds of a wrong number rather than a
  // Second HEAD on every clone. See /docs/platform/storage-quotas
  //
  // Before the copy, never after it: Event Grid orders nothing, and an event that arrives before the row
  // Exists is dropped for good — `reconcileStorageLedgerEntry` reads a blob nothing reserved as unaccounted
  // Rather than as an error, so nothing retries it and the provisional figure would stand for the blob's life
  await chargeStorageLedgerEntry(db, userId, AzureContainer.ResourceAssets, destinationBlobName, contentLength);
  // The charge is a claim about a blob, so it is unwound the moment the blob turns out not to exist — bytes
  // Held against an owner for a copy that never landed are the one drift no later event corrects, since a
  // Destination name is minted per clone and nothing ever writes or deletes it again
  await getResultAsync(() => copyBlob(containerClient, blobName, destinationBlobName)).match(noop, async (error) => {
    await releaseStorageLedgerEntries(db, AzureContainer.ResourceAssets, [destinationBlobName]);
    throw error;
  });
  return [[url, getResourceAssetUrl(destinationBlobName)] as const];
};
// Publish, duplicate and restore all snapshot content whose assets must survive the source's working copies
// Changing: every referenced asset blob is cloned into the destination directory's files directory under a
// New id and the content rewritten to the clone's url. Only the filename carries over, so a foreign-id url
// (duplicated or blueprint-deployed content) clones correctly by construction and a clone of a published
// Asset never lands under the destination's own published prefix, which unpublishing wipes — which is also
// Why the rewrite is a per-url map, never a prefix replace
export const cloneContentAssets = async <TContent>(
  db: Database,
  userId: string,
  content: TContent,
  destinationDirectoryName: string,
): Promise<TContent> => {
  // A url of ours that content carries in absolute form is still a url of ours, but the asset regex refuses it
  // On purpose — the lookbehind is the only thing keeping a FOREIGN absolute url whose path happens to carry
  // Our prefix from being rewritten into a local one. The origin is what tells the two apart, so same-origin
  // Urls are relativized into the form every other path writes rather than the anchor being loosened for both.
  // The app produces this form itself (`exportPersonalizedHtml` absolutizes for email), so it re-enters content
  // Whenever exported html is pasted back into an editor; left absolute, publish clones none of those assets and
  // The snapshot points anonymous viewers at the owner-only working copy.
  // Read straight off the environment the runtime config binds `public.baseUrl` to, rather than through
  // `useRuntimeConfig`: this is a plain service, called from procedures and from tests that hold no Nuxt app
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
  // Every clone is written under a freshly minted asset id, never the source's. A destination name carried
  // Over from the source is a name with a history: `restorePublishedVersion` clones back into the working
  // Copy's own `{id}/files`, so a snapshot of a file the editor has since deleted would rebuild the exact
  // Name that delete already published for deletion — and a named-blob deletion event carries no time bound
  // (/docs/architecture/blob-lifecycle), so its redelivery or dead-letter replay destroys the restored blob.
  // Minting also removes the collision between two sources reducing to one destination (a working copy and a
  // Published snapshot of the same file share everything from `files/` onwards, and content can embed both),
  // Which would otherwise race two copies onto one name and unwind the whole clone. Nothing reads the id back
  // Out of a blob name — the rewrite map below is what points content at it.
  // Readability is a property of the RESOURCE, not of the url, and content routinely names one resource's assets
  // Many times over (a logo repeated on every row, a gallery of a hundred images from one upload). Asked per url
  // That is two Drizzle queries each, unbounded and in parallel, for an answer already computed — so the promise
  // Itself is cached, which also collapses the concurrent asks that a Promise.all issues before any of them lands.
  // Cached as the two questions the answer is made of, each keyed by the resource alone, rather than as one answer
  // Keyed by the url's kind: ownership answers a working-copy url and a published one alike, and it is exactly the
  // Query the published branch falls through to when there is no publication row — so a single cache keyed by kind
  // Issued that same ownership lookup twice for one resource, which is the duplication the cache exists to remove.
  // Ownership is asked first for the same reason: it settles both kinds, and it costs nothing for an anonymous
  // Caller, who has no ownership to check
  const isOwnedMap = new Map<string, Promise<boolean>>();
  const isPublishedReadableMap = new Map<string, Promise<boolean>>();
  const getIsReadable = async ({ isPublished, resourceId }: ResourceAssetPath) => {
    if (
      await getOrCreate(isOwnedMap, resourceId, () =>
        checkIsResourceAssetReadable(db, { isPublished: false, resourceId }, userId),
      )
    )
      return true;
    if (!isPublished) return false;
    // Asked without the caller: ownership is the branch the published check falls through to when there is no
    // Publication row, and it has already answered no for this resource — passing them here would issue that
    // Same query a second time to learn it again
    return getOrCreate(isPublishedReadableMap, resourceId, () =>
      checkIsResourceAssetReadable(db, { isPublished: true, resourceId }),
    );
  };
  const clones = (
    await Promise.all(
      [...urls].map(async (url) => {
        const resourceAssetPath = parseResourceAssetPath(url.slice(`${RESOURCE_ASSETS_URL_PREFIX}/`.length));
        // An unparseable url is data, not an error — carried exactly as the content wrote it. A published url is
        // Cloned like any other: it names another publication's directory, which that resource's next unpublish
        // Wipes wholesale, so carrying it verbatim would leave this snapshot's images 404ing on an operation its
        // Owner never performed. The destination is always `{directory}/files/{uuid}|{name}`, so a clone under a
        // Publish directory is exactly the five-segment shape parseResourceAssetPath accepts
        if (!resourceAssetPath) return [];
        // Content may legitimately name a url this caller cannot read — a foreign working copy whose absolute url
        // Reached them through a personalized export, say. Copying it would hand them the blob the serving
        // Endpoint refuses them, published under a directory anyone can read, so an unreadable url is carried
        // Verbatim like any other reference the clone cannot follow
        if (!(await getIsReadable(resourceAssetPath))) return [];
        const { blobName } = resourceAssetPath;
        const fileSegment = blobName.slice(blobName.lastIndexOf("/") + 1);
        const separatorIndex = fileSegment.indexOf(ID_SEPARATOR);
        const filename = separatorIndex === -1 ? fileSegment : fileSegment.slice(separatorIndex + 1);
        const destinationBlobName = `${destinationDirectoryName}/${FILES_DIRECTORY_SEGMENT}/${crypto.randomUUID()}${ID_SEPARATOR}${filename}`;
        return [{ blobName, destinationBlobName, url }];
      }),
    )
  ).flat();
  // Two storage round trips per asset, so content referencing hundreds of them would open that many connections
  // At once and be throttled into failing the whole publish — they go out in bounded waves instead. `settleAll`
  // Rather than `Promise.all` per wave because every caller rolls back on failure by deleting the destination
  // Directory: a copy still in flight when that delete runs lands after it, under a directory whose resource row
  // Is already gone in duplicateResource's case, so nothing reaches the blob again
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
  // One event for the whole clone rather than one per asset: content naming hundreds of them is a single
  // Publish as far as the owner's meter is concerned, and the last of those events is the only one that says
  // Anything the one before it did not
  await emitStorageUsage(db, userId);
  return deepReplaceStrings(relativizedContent, (value) =>
    value.replaceAll(RESOURCE_ASSET_URL_REGEX, (url) => updatedUrlMap.get(url) ?? url),
  );
};
