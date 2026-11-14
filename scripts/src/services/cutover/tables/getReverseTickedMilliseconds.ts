import { AZURE_SELF_DESTRUCT_TIMER } from "@esposter/db-schema";

const SELF_DESTRUCT_TIMER_BIGINT = BigInt(AZURE_SELF_DESTRUCT_TIMER);
const NANOSECONDS_PER_MILLISECOND = 1000000n;

// The epoch milliseconds a reverse-ticked row key was made at. The key counts down from the self-destruct timer, in the
// nanoseconds `now` returns, so the difference is the time since the epoch
export const getReverseTickedMilliseconds = (reverseTickedTimestamp: string): number =>
  Number((SELF_DESTRUCT_TIMER_BIGINT - BigInt(reverseTickedTimestamp)) / NANOSECONDS_PER_MILLISECOND);
