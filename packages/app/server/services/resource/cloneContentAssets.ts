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
import { AzureContainer } from "@esposter/db-schema";

// The rewrite entry for one working-copy asset url, or nothing when the referenced blob is missing — a
// Dangling reference (the asset was deleted but the content still embeds its url) is data like an
// Unparseable url, carried verbatim instead of failing the whole clone
const cloneAsset = async (
  containerClient: ContainerClient,
  url: string,
  blobName: string,
  destinationBlobName: string,
): Promise<(readonly [string, string])[]> => {
  const sourceBlockBlobClient = containerClient.getBlockBlobClient(blobName);
  if (!(await sourceBlockBlobClient.exists())) return [];
  // The copy source is the SDK client's own url so the service receives the percent-encoded form of the
  // Decoded blob name — same-account copies need no SAS (the duplicate flow's copyBlob precedent)
  await copyBlob(containerClient, sourceBlockBlobClient.url, destinationBlobName);
  return [[url, getResourceAssetUrl(destinationBlobName)] as const];
};

// Publish and duplicate both snapshot content whose assets must survive the source's working copies
// Changing: every referenced asset blob is cloned into the destination directory's files directory and the
// Content rewritten to the clone's url. The destination path keeps only the files-relative tail, so a
// Foreign-id url (duplicated or blueprint-deployed content) clones correctly by construction and a clone of a
// Published asset never lands under the destination's own published prefix, which unpublishing wipes — which
// Is also why the rewrite is a per-url map, never a prefix replace
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
  const updatedUrlEntries = await Promise.all(
    [...urls].flatMap((url) => {
      const resourceAssetPath = parseResourceAssetPath(url.slice(`${RESOURCE_ASSETS_URL_PREFIX}/`.length));
      // An unparseable url is data, not an error — carried exactly as the content wrote it. A published url
      // Is an immutable snapshot reference: a duplicate clones it too (the copy must be fully self-contained
      // Under its own directory), while a publish carries it as-is — re-cloning under a publish directory
      // Would nest an unparseable published/{n}/published/{m} path
      if (!resourceAssetPath || (resourceAssetPath.isPublished && !isPublishedAssetCloned)) return [];
      const { blobName } = resourceAssetPath;
      const destinationBlobName = `${destinationDirectoryName}/${blobName.slice(blobName.indexOf(`/${FILES_DIRECTORY_SEGMENT}/`) + 1)}`;
      return [cloneAsset(containerClient, url, blobName, destinationBlobName)];
    }),
  );
  const updatedUrlMap = new Map(updatedUrlEntries.flat());
  if (updatedUrlMap.size === 0) return content;
  return deepReplaceStrings(content, (value) =>
    value.replaceAll(RESOURCE_ASSET_URL_REGEX, (url) => updatedUrlMap.get(url) ?? url),
  );
};
