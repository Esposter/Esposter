import { AZURE_SELF_DESTRUCT_TIMER } from "@/utils/azure";
import { now } from "@/utils/time";

// Calculation for azure table storage row key by using reverse-ticked timestamp in nanoseconds
export const getReverseTickedTimestamp = () =>
  (BigInt(AZURE_SELF_DESTRUCT_TIMER) - BigInt(now())).toString().padStart(AZURE_SELF_DESTRUCT_TIMER.length, "0");
