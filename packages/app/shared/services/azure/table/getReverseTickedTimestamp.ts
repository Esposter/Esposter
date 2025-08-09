import { AZURE_SELF_DESTRUCT_TIMER } from "#shared/services/esbabbler/constants";
import { now } from "#shared/util/time/now";
// Reverse-ticked timestamp in nanoseconds
export const getReverseTickedTimestamp = (timestamp = now()) =>
  (BigInt(AZURE_SELF_DESTRUCT_TIMER) - BigInt(timestamp)).toString();
