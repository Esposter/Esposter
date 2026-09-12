import type { Transaction } from "@@/server/models/db/Transaction";
import type { Context } from "@@/server/trpc/context";
import type { Resource, ResourceVersion } from "@esposter/db-schema";
import type { WrittenVersion } from "keyframe-store";

import { collectSnapshotObjects } from "@@/server/services/resource/snapshot/collectSnapshotObjects";
import { createSnapshotObjectStore } from "@@/server/services/resource/snapshot/createSnapshotObjectStore";
import { getSnapshotSummary } from "@@/server/services/resource/snapshot/getSnapshotSummary";
import { readSnapshotAnchor } from "@@/server/services/resource/snapshot/readSnapshotAnchor";
import { resourceVersions } from "@esposter/db-schema";
import { createKeyframeStore } from "keyframe-store";

// The one way a version is taken, whichever channel it lands in: the content goes into the store against the
// Channel's current anchor, and the row that makes it visible follows. The object is durable before the row
// Exists, so a failure between the two leaves no version rather than a row naming nothing — the correct
// Outcome for a version that was never stored. What the write cost is handed back rather than charged here,
// Because a publish takes its version inside a transaction and the charge locks the ledger row and then the
// User's, which a transaction must not be held open across (/docs/resource/storage-quotas)
export const writeSnapshotVersion = async (
  db: Context["db"] | Transaction,
  resource: Pick<Resource, "id" | "type">,
  { channel, reason, version }: Pick<ResourceVersion, "channel" | "version"> & Partial<Pick<ResourceVersion, "reason">>,
  serializedContent: string,
): Promise<WrittenVersion> => {
  const { id } = resource;
  const keyframeStore = createKeyframeStore(await createSnapshotObjectStore(id));
  const anchor = await readSnapshotAnchor(db, id, channel);
  const writtenVersion = await keyframeStore.write(Buffer.from(serializedContent), anchor).match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
  const { baseHash, hash, plaintextBytes, storedBytes } = writtenVersion;
  const summary = getSnapshotSummary(resource.type, serializedContent);
  // The one rewrite of a version: a publish repairing its own snapshot at the version it already claimed.
  // The row moves to the new object, and the one it named is collected if nothing else still does
  const previousVersion = await db.query.resourceVersions.findFirst({
    columns: { baseHash: true, hash: true },
    where: { channel: { eq: channel }, resourceId: { eq: id }, version: { eq: version } },
  });
  await db
    .insert(resourceVersions)
    .values({ baseHash, channel, hash, plaintextBytes, reason, resourceId: id, storedBytes, summary, version })
    .onConflictDoUpdate({
      set: { baseHash, hash, plaintextBytes, storedBytes, summary },
      target: [resourceVersions.resourceId, resourceVersions.channel, resourceVersions.version],
    });
  if (previousVersion && previousVersion.hash !== hash) await collectSnapshotObjects(db, id, [previousVersion]);
  return writtenVersion;
};
