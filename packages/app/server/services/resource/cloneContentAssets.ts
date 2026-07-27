import type { ContainerClient } from "@azure/storage-blob";

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
import { copyBlob } from "@esposter/db";
import { AzureContainer, MAX_CONCURRENT_BLOB_COPIES } from "@esposter/db-schema";
import { chunk, ID_SEPARATOR } from "@esposter/shared";

// The rewrite entry for one working-copy asset url, or nothing when the referenced blob is missing — a
// Dangling reference (the asset was deleted but the content still embeds its url) is data like an
// Unparseable url, carried verbatim instead of failing the whole clone
const cloneAsset = async (
  containerClient: ContainerClient,
  url: string,
  blobName: string,
  destinationBlobName: string,
): Promise<(readonly [string, string])[]> => {
  if (!(await containerClient.getBlockBlobClient(blobName).exists())) return [];
  await copyBlob(containerClient, blobName, destinationBlobName);
  return [[url, getResourceAssetUrl(destinationBlobName)] as const];
};

// Publish, duplicate and restore all snapshot content whose assets must survive the source's working copies
// Changing: every referenced asset blob is cloned into the destination directory's files directory under a
// New id and the content rewritten to the clone's url. Only the filename carries over, so a foreign-id url
// (duplicated or blueprint-deployed content) clones correctly by construction and a clone of a published
// Asset never lands under the destination's own published prefix, which unpublishing wipes — which is also
// Why the rewrite is a per-url map, never a prefix replace
export const cloneContentAssets = async <TContent>(
  content: TContent,
  destinationDirectoryName: string,
  isPublishedAssetCloned: boolean,
): Promise<TContent> => {
  const urls = new Set<string>();
  deepVisitStrings(content, (value) => {
    for (const [url] of value.matchAll(RESOURCE_ASSET_URL_REGEX)) urls.add(url);
  });
  if (urls.size === 0) return content;

  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  // Every clone is written under a freshly minted asset id, never the source's. A destination name carried
  // Over from the source is a name with a history: `restorePublishedVersion` clones back into the working
  // Copy's own `{id}/files`, so a snapshot of a file the editor has since deleted would rebuild the exact
  // Name that delete already published for deletion — and a named-blob deletion event carries no time bound
  // (/docs/architecture/blob-lifecycle), so its redelivery or dead-letter replay destroys the restored blob.
  // Minting also removes the collision between two sources reducing to one destination (a working copy and a
  // Published snapshot of the same file share everything from `files/` onwards, and content can embed both),
  // Which would otherwise race two copies onto one name and unwind the whole clone. Nothing reads the id back
  // Out of a blob name — the rewrite map below is what points content at it
  const clones = [...urls].flatMap((url) => {
    const resourceAssetPath = parseResourceAssetPath(url.slice(`${RESOURCE_ASSETS_URL_PREFIX}/`.length));
    // An unparseable url is data, not an error — carried exactly as the content wrote it. A published url
    // Is an immutable snapshot reference: a duplicate clones it too (the copy must be fully self-contained
    // Under its own directory), while a publish carries it as-is — re-cloning under a publish directory
    // Would nest an unparseable published/{n}/published/{m} path
    if (!resourceAssetPath || (resourceAssetPath.isPublished && !isPublishedAssetCloned)) return [];
    const { blobName } = resourceAssetPath;
    const fileSegment = blobName.slice(blobName.lastIndexOf("/") + 1);
    const separatorIndex = fileSegment.indexOf(ID_SEPARATOR);
    const filename = separatorIndex === -1 ? fileSegment : fileSegment.slice(separatorIndex + 1);
    const destinationBlobName = `${destinationDirectoryName}/${FILES_DIRECTORY_SEGMENT}/${crypto.randomUUID()}${ID_SEPARATOR}${filename}`;
    return [{ blobName, destinationBlobName, url }];
  });
  // Two storage round trips per asset, so content referencing hundreds of them would open that many connections
  // At once and be throttled into failing the whole publish — they go out in bounded waves instead
  const updatedUrlEntries: (readonly [string, string])[] = [];
  for (const clonesChunk of chunk(clones, MAX_CONCURRENT_BLOB_COPIES)) {
    const clonedUrlEntries = await Promise.all(
      clonesChunk.map(({ blobName, destinationBlobName, url }) =>
        cloneAsset(containerClient, url, blobName, destinationBlobName),
      ),
    );
    updatedUrlEntries.push(...clonedUrlEntries.flat());
  }

  const updatedUrlMap = new Map(updatedUrlEntries);
  if (updatedUrlMap.size === 0) return content;
  return deepReplaceStrings(content, (value) =>
    value.replaceAll(RESOURCE_ASSET_URL_REGEX, (url) => updatedUrlMap.get(url) ?? url),
  );
};
