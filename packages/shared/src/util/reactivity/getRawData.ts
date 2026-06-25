// Vue's reactivity protocol exposes a proxy's underlying target on the `__v_raw` flag. Reading that flag
// Directly — instead of importing vue's `toRaw` — keeps this util (and `Serializable`, which depends on it)
// Usable from vue-free packages like db-schema. This mirrors vue's `toRaw` exactly: it follows `__v_raw`
// Recursively (covering reactive, readonly, shallow, and nested proxy wraps) until it reaches the raw target.
interface MaybeReactive {
  __v_raw?: unknown;
}

export const getRawData = <T>(data: T): T => {
  // oxlint-disable-next-line no-underscore-dangle
  const raw = data && (data as MaybeReactive).__v_raw;
  return raw ? getRawData(raw as T) : data;
};
