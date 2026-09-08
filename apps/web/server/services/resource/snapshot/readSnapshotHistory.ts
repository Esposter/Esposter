import type { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import type { SnapshotReason } from "#shared/models/resource/SnapshotReason";
import type { SnapshotVersion } from "#shared/models/resource/SnapshotVersion";
import type { Resource } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { AzureContainer } from "@esposter/db-schema";
import { getDecodedUriComponent } from "@esposter/shared";

// The retained snapshots are the source of truth, so the history is enumerated straight from blob storage with
// No history table. Each {version}.json blob directly under {id}/{channel}/ is one snapshot — an immutable
// Channel's asset clones live in per-attempt {snapshotId}/ subdirectories, which the hierarchy delimiter keeps
// Out.
//
// Which one is current is passed in rather than derived, because the listing answers which snapshots exist and
// Only a row answers which is live. The two do disagree: unpublish drops the row and sweeps the prefix through a
// Best-effort event, so a republish moments later restarts at 1 while snapshots 1..n are still present, and a
// Highest-version-wins rule would badge a retired snapshot as live. No row means nothing is current
export const readSnapshotHistory = async (
  id: Resource["id"],
  channel: SnapshotChannel,
  currentVersion?: number,
): Promise<SnapshotVersion[]> => {
  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  const prefix = `${id}/${channel}/`;
  const snapshotVersions: Except<SnapshotVersion, "isCurrent">[] = [];
  // The reason and the summary ride the blob's own metadata, which is what lets a row say what it is without
  // The listing opening a single snapshot — the alternative is one download per row on every history read
  for await (const blob of containerClient.listBlobsByHierarchy("/", { includeMetadata: true, prefix })) {
    if (blob.kind !== "blob") continue;
    const version = Number(blob.name.slice(prefix.length).replace(/\.json$/u, ""));
    if (!Number.isInteger(version) || version <= 0) continue;
    // Written percent-encoded because metadata travels as http headers and a summary is built from content the
    // Owner typed. A snapshot written before either field existed simply has neither, which reads as a bare row
    // Rather than as a parse failure
    const { reason, summary = "" } = blob.metadata ?? {};
    snapshotVersions.push({
      channel,
      reason: reason as SnapshotReason | undefined,
      summary: getDecodedUriComponent(summary, summary),
      takenAt: blob.properties.lastModified,
      version,
    });
  }
  return snapshotVersions.map((snapshotVersion) =>
    Object.assign(snapshotVersion, { isCurrent: snapshotVersion.version === currentVersion }),
  );
};
