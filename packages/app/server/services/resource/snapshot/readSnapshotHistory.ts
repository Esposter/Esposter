import type { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import type { SnapshotReason } from "#shared/models/resource/SnapshotReason";
import type { SnapshotVersion } from "#shared/models/resource/SnapshotVersion";
import type { Resource } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { AzureContainer } from "@esposter/db-schema";
import { getDecodedUriComponent } from "@esposter/shared";

// The retained snapshots are the source of truth, so the history is enumerated straight from blob storage
// With no history table. Each {version}.json blob directly under {id}/{channel}/ is one snapshot — an
// Immutable channel's asset clones live in per-attempt {snapshotId}/ subdirectories, which the hierarchy
// Delimiter keeps out.
//
// Which one is *current* is passed in rather than derived, because only the caller knows: the listing answers
// Which snapshots exist, and a row answers which is live. Deriving it here (highest version wins) breaks the
// Moment the two disagree, and they do — unpublish drops the row and sweeps the prefix through a best-effort
// Event, so a republish moments later restarts at 1 while snapshots 1..n are still present, and the timeline
// Would badge a retired snapshot as the live one while the public route served the new version 1. A channel
// With nothing live passes nothing, and no row means nothing is current
export const readSnapshotHistory = async (
  id: Resource["id"],
  channel: SnapshotChannel,
  currentVersion?: number,
): Promise<SnapshotVersion[]> => {
  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  const prefix = `${id}/${channel}/`;
  const entries: Except<SnapshotVersion, "isCurrent">[] = [];
  // The reason and the label ride the blob's own metadata, which is what lets a row say what it is without
  // The listing opening a single snapshot — the alternative is one download per row on every history read
  for await (const blob of containerClient.listBlobsByHierarchy("/", { includeMetadata: true, prefix })) {
    if (blob.kind !== "blob") continue;
    const version = Number(blob.name.slice(prefix.length).replace(/\.json$/u, ""));
    if (!Number.isInteger(version) || version <= 0) continue;
    // Written percent-encoded because metadata travels as http headers and a label is whatever the owner
    // Typed. A snapshot written before either field existed simply has neither, which reads as an unlabelled
    // Row rather than as a parse failure
    const { label = "", reason } = blob.metadata ?? {};
    entries.push({
      channel,
      label: getDecodedUriComponent(label, label),
      reason: reason as SnapshotReason | undefined,
      takenAt: blob.properties.lastModified,
      version,
    });
  }
  return entries.map((entry) => Object.assign(entry, { isCurrent: entry.version === currentVersion }));
};
