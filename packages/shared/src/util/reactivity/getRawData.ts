import type { MaybeReactive } from "#src/models/reactivity/MaybeReactive";

// Reading the `__v_raw` flag directly — instead of importing vue's `toRaw` — keeps this util (and `Serializable`,
// Which depends on it) usable from vue-free packages like db-schema. This mirrors vue's `toRaw` exactly: it
// Follows `__v_raw` recursively (covering reactive, readonly, shallow, and nested proxy wraps) until it reaches
// The raw target.
export const getRawData = <T>(data: T): T => {
  // oxlint-disable-next-line no-underscore-dangle
  const raw = data && (data as MaybeReactive).__v_raw;
  return raw ? getRawData(raw as T) : data;
};
