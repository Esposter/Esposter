import { dayjs } from "#shared/services/dayjs";
// How long an index row whose message entity has not landed yet is treated as a write still in flight rather than as
// The orphan a failed write left behind. `createMessage` writes the two tables in that order and they cannot be
// Written atomically, so the ascending read has to tell those two apart: it holds the cursor on the first and steps
// Over the second. Generous on purpose — a single table write overshooting this is far rarer than a scroll that
// Permanently skips a message, and the only cost of overshooting the other way is one stalled page.
export const MESSAGE_INDEX_WRITE_GRACE_NANOSECONDS = BigInt(dayjs.duration(1, "minute").asMilliseconds()) * 10n ** 6n;
