import type { LastPush } from "#src/models/queue/LastPush";

import { formatAge } from "#src/services/fleet/formatAge";

// What a machine last pushed, as its count and how long ago it landed, or a dash for a machine that has pushed none
export const formatPushed = (lastPush: LastPush | undefined, now: number): string =>
  lastPush === undefined
    ? "—"
    : `${lastPush.count} commits, ${formatAge(now - Temporal.Instant.from(lastPush.at).epochMilliseconds)} ago`;
