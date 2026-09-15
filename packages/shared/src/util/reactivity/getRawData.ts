import type { MaybeReactive } from "#src/models/reactivity/MaybeReactive";

// Mirrors vue's `toRaw` without importing it (`MaybeReactive` says why): the `__v_raw` flag is followed recursively —
// Reactive, readonly, shallow and nested proxy wraps alike — until it reaches the raw target.
export const getRawData = <T>(data: T): T => {
  // oxlint-disable-next-line no-underscore-dangle
  const raw = data && (data as MaybeReactive).__v_raw;
  return raw ? getRawData(raw as T) : data;
};
