import type { SnapshotVersion } from "#shared/models/resource/SnapshotVersion";

import { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import { ID_SEPARATOR } from "@esposter/shared";

// The inverse of getSnapshotVersionId, over a value that arrives through the route and is therefore whatever
// The address bar holds. An id naming no channel, or no positive version, resolves to nothing rather than to a
// Row the panel would go on to render
export const parseSnapshotVersionId = (
  snapshotVersionId: string,
): Pick<SnapshotVersion, "channel" | "version"> | undefined => {
  const [channelSegment, versionSegment] = snapshotVersionId.split(ID_SEPARATOR);
  const channel = Object.values(SnapshotChannel).find((snapshotChannel) => snapshotChannel === channelSegment);
  const version = Number(versionSegment);
  if (!channel || !Number.isInteger(version) || version <= 0) return undefined;
  return { channel, version };
};
