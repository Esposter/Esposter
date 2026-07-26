import type { PublishHistoryVersion } from "#shared/models/resource/PublishHistoryVersion";
import type { Resource } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { PUBLISHED_DIRECTORY_SEGMENT } from "#shared/services/resource/constants";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { AzureContainer } from "@esposter/db-schema";

// The retained snapshots are the source of truth, so the history is enumerated straight from blob storage
// With no history table. Each {version}.json blob directly under {id}/published/ is one snapshot — the asset
// Clones live in per-attempt {publishId}/ subdirectories, which the hierarchy delimiter keeps out
export const readPublishHistory = async (id: Resource["id"]): Promise<PublishHistoryVersion[]> => {
  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  const prefix = `${id}/${PUBLISHED_DIRECTORY_SEGMENT}/`;
  const entries: Except<PublishHistoryVersion, "isCurrent">[] = [];
  for await (const blob of containerClient.listBlobsByHierarchy("/", { prefix })) {
    if (blob.kind !== "blob") continue;
    const version = Number(blob.name.slice(prefix.length).replace(/\.json$/u, ""));
    if (!Number.isInteger(version) || version <= 0) continue;
    entries.push({ publishedAt: blob.properties.lastModified, version });
  }
  // The highest version is always the currently-published one — publishVersion only ever increments and
  // Unpublish clears the whole history, so no lower snapshot can be the live publication
  const currentVersion = entries.reduce((max, { version }) => Math.max(max, version), 0);
  return entries.map((entry) => Object.assign(entry, { isCurrent: entry.version === currentVersion }));
};
