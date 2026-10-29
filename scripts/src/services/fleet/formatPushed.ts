import type { LastPush } from "#src/models/shared/LastPush";

import { formatAge } from "#src/services/shared/formatAge";

// How long ago a machine last landed a commit on the queue, or a dash for a machine that has landed none
export const formatPushed = (lastPush: LastPush | undefined, now: number): string =>
  lastPush === undefined ? "—" : `${formatAge(now - Temporal.Instant.from(lastPush.at).epochMilliseconds)} ago`;
