import { AZURE_SELF_DESTRUCT_TIMER } from "#src/services/azure/table/constants";
import { now } from "@esposter/shared";

const AZURE_SELF_DESTRUCT_TIMER_BIGINT = BigInt(AZURE_SELF_DESTRUCT_TIMER);
// Counted down from a fixed maximum, in the nanoseconds `now` returns, so a lexical rowKey sort reads
// Newest-first
export const getReverseTickedTimestamp = (timestamp = now()) =>
  (AZURE_SELF_DESTRUCT_TIMER_BIGINT - BigInt(timestamp)).toString();
