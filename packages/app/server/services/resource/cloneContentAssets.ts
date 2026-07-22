import type { ContainerClient } from "@azure/storage-blob";

import { RESOURCE_ASSET_URL_REGEX, RESOURCE_ASSETS_URL_PREFIX } from "#shared/services/resource/constants";
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
// Changing: every referenced working-copy asset blob is cloned under the destination directory and the
// Content rewritten to the clone's url. The destination path drops the *source* resource id, so a foreign-id
// Url (duplicated or blueprint-deployed content) clones correctly by construction — which is also why the
// Rewrite is a per-url map, never a prefix replace
export const cloneContentAssets = async <TContent>(
  content: TContent,
  destinationDirectoryName: string,
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
      // An unparseable url is data, not an error, and an already-published url points at an immutable
      // Snapshot — both are carried exactly as the content wrote them
      if (!resourceAssetPath || resourceAssetPath.isPublished) return [];
      const { blobName } = resourceAssetPath;
      const destinationBlobName = `${destinationDirectoryName}/${blobName.slice(blobName.indexOf("/") + 1)}`;
      return [cloneAsset(containerClient, url, blobName, destinationBlobName)];
    }),
  );
  const updatedUrlMap = new Map(updatedUrlEntries.flat());
  if (updatedUrlMap.size === 0) return content;
  return deepReplaceStrings(content, (value) =>
    value.replaceAll(RESOURCE_ASSET_URL_REGEX, (url) => updatedUrlMap.get(url) ?? url),
  );
};
