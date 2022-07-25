import { AZURE_SELF_DESTRUCT_TIMER, isServer } from "@/util/constants";
import BigInt from "big-integer";

/**
 * Get current epoch time in nanoseconds.
 */
export const now = async () => {
  const [ms, ns] = isServer() ? process.hrtime() : (await import("browser-hrtime")).default();
  return BigInt(ms).times(1e9).plus(ns).toString();
};

/**
 * Calculation for azure table storage RowKey by using reverse-ticked timestamp in nanoseconds.
 */
export const rowKey = async () =>
  BigInt(AZURE_SELF_DESTRUCT_TIMER)
    .minus(BigInt(await now()))
    .toString()
    .padStart(AZURE_SELF_DESTRUCT_TIMER.length, "0");
