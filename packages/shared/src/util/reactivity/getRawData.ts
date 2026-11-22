import type { MaybeReactive } from "#src/models/reactivity/MaybeReactive";

// Any object may be a proxy, and the flag is optional on every one, so the guard narrows to the shape the flag takes
const checkIsMaybeReactive = <T>(data: T): data is MaybeReactive<T> & T => typeof data === "object" && data !== null;

// Mirrors vue's `toRaw` without importing it (`MaybeReactive` says why): the `__v_raw` flag is followed recursively —
// Reactive, readonly, shallow and nested proxy wraps alike — until it reaches the raw target.
export const getRawData = <T>(data: T): T => {
  // oxlint-disable-next-line no-underscore-dangle -- `__v_raw` is Vue's own marker for a proxy's target
  const raw = checkIsMaybeReactive(data) ? data.__v_raw : undefined;
  return raw ? getRawData(raw) : data;
};
