// Vue's reactivity protocol exposes a proxy's underlying target on the `__v_raw` flag and marks reactive
// Proxies with `__v_isReactive`. Reading these flags directly — instead of importing vue's `toRaw`/`isReactive`
// — keeps this util (and `Serializable`, which depends on it) usable from vue-free packages like db-schema,
// While behaving identically to vue's own `toRaw`.
interface MaybeReactive {
  __v_isReactive?: boolean;
  __v_raw?: unknown;
}

export const getRawData = <T>(data: T): T => {
  const maybeReactive = data as MaybeReactive;
  // oxlint-disable-next-line no-underscore-dangle
  return maybeReactive.__v_isReactive ? (maybeReactive.__v_raw as T) : data;
};
