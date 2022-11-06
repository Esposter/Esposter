import BigInt from "big-integer";
import { now } from "@/util/constants.common";
import { AZURE_SELF_DESTRUCT_TIMER } from "@/util/constants.server";

// Calculation for azure table storage row key by using reverse-ticked timestamp in nanoseconds
export const getReverseTickedTimestamp = () =>
  BigInt(AZURE_SELF_DESTRUCT_TIMER).minus(BigInt(now())).toString().padStart(AZURE_SELF_DESTRUCT_TIMER.length, "0");
