import type { PublishHistoryVersion } from "#shared/models/resource/PublishHistoryVersion";
import type { Resource } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { AzureContainer } from "@esposter/db-schema";

// The retained snapshots are the source of truth, so the history is enumerated straight from blob storage
// with no history table. Each {version}.json blob directly under {id}/published/ is one snapshot — Survey's
// per-version asset clones live in {version}/ subdirectories, which the hierarchy delimiter keeps out
export const readPublishHistory = async (id: Resource["id"]): Promise<PublishHistoryVersion[]> => {
  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  const prefix = `${id}/published/`;
  const entries: Except<PublishHistoryVersion, "isCurrent">[] = [];
  for await (const blob of containerClient.listBlobsByHierarchy("/", { prefix })) {
    if (blob.kind !== "blob") continue;
    const version = Number(blob.name.slice(prefix.length).replace(/\.json$/u, ""));
    if (!Number.isInteger(version) || version <= 0) continue;
    entries.push({ publishedAt: blob.properties.lastModified, version });
  }
  // The highest version is always the currently-published one — publishVersion only ever increments and
  // unpublish clears the whole history, so no lower snapshot can be the live publication
  const currentVersion = Math.max(0, ...entries.map(({ version }) => version));
  return entries.map((entry) => ({ ...entry, isCurrent: entry.version === currentVersion }));
};
