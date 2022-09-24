import BigInt from "big-integer";
import hrtime from "browser-hrtime";
import { AZURE_SELF_DESTRUCT_TIMER, isServer } from "@/util/constants";

/**
 * Get current epoch time in nanoseconds.
 */
export const now = () => {
  const [ms, ns] = isServer() ? process.hrtime() : hrtime();
  return BigInt(ms).times(1e9).plus(ns).toString();
};

/**
 * Calculation for azure table storage RowKey by using reverse-ticked timestamp in nanoseconds.
 */
export const rowKey = () =>
  BigInt(AZURE_SELF_DESTRUCT_TIMER).minus(BigInt(now())).toString().padStart(AZURE_SELF_DESTRUCT_TIMER.length, "0");
