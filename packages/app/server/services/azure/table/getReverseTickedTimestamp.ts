import { AZURE_SELF_DESTRUCT_TIMER } from "@/server/services/azure/table/constants";
import { now } from "@/util/time/now";

// Reverse-ticked timestamp in nanoseconds
export const getReverseTickedTimestamp = () => (BigInt(AZURE_SELF_DESTRUCT_TIMER) - BigInt(now())).toString();