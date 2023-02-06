import { now } from "@/utils/time";

// A crazy big timestamp that indicates how long before azure table storage
// completely ***ks up trying to insert a negative row key
export const AZURE_SELF_DESTRUCT_TIMER = "999999999999999999999999999999";
export const AZURE_MAX_BATCH_SIZE = 100;

// Calculation for azure table storage row key by using reverse-ticked timestamp in nanoseconds
export const getReverseTickedTimestamp = () =>
  (BigInt(AZURE_SELF_DESTRUCT_TIMER) - BigInt(now())).toString().padStart(AZURE_SELF_DESTRUCT_TIMER.length, "0");
