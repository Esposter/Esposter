import { AZURE_SELF_DESTRUCT_TIMER } from "@/services/azure/table/constants";
import { now } from "@esposter/shared";
// Reverse-ticked timestamp in nanoseconds
export const getReverseTickedTimestamp = (timestamp = now()) =>
  (BigInt(AZURE_SELF_DESTRUCT_TIMER) - BigInt(timestamp)).toString();
