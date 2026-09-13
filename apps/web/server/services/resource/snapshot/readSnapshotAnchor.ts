import type { Transaction } from "@@/server/models/db/Transaction";
import type { Context } from "@@/server/trpc/context";
import type { Resource, SnapshotChannel } from "@esposter/db-schema";
import type { VersionAnchor } from "keyframe-store";

import { resourceVersions } from "@esposter/db-schema";
import { and, eq, gt, sum } from "drizzle-orm";

// A channel's current anchor is derived, never stored: the newest row whose base is empty is the keyframe
// Every later version was encoded against, and the bytes anchored to it are the stored sizes of the rows above
// It. A column holding either would be a second source of truth for what one indexed read answers, and one
// That could disagree with the rows after a failed write
export const readSnapshotAnchor = async (
  db: Context["db"] | Transaction,
  resourceId: Resource["id"],
  channel: SnapshotChannel,
): Promise<VersionAnchor> => {
  const anchorVersion = await db.query.resourceVersions.findFirst({
    columns: { hash: true, version: true },
    orderBy: { version: "desc" },
    where: { baseHash: { eq: "" }, channel: { eq: channel }, resourceId: { eq: resourceId } },
  });
  if (!anchorVersion) return { anchoredBytes: 0, hash: "" };

  const [anchoredVersions] = await db
    .select({ anchoredBytes: sum(resourceVersions.storedBytes) })
    .from(resourceVersions)
    .where(
      and(
        eq(resourceVersions.resourceId, resourceId),
        eq(resourceVersions.channel, channel),
        gt(resourceVersions.version, anchorVersion.version),
      ),
    );
  return { anchoredBytes: Number(anchoredVersions?.anchoredBytes ?? 0), hash: anchorVersion.hash };
};
