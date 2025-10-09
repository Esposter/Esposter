import { AZURE_SELF_DESTRUCT_TIMER } from "@/services/azure/table/constants";
import { now } from "@/util/time/now";
// Reverse-ticked timestamp in nanoseconds
export const getReverseTickedTimestamp = (timestamp: string = now()): string =>
  (BigInt(AZURE_SELF_DESTRUCT_TIMER) - BigInt(timestamp)).toString();
