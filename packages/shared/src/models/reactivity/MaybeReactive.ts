// Vue's reactivity protocol exposes a proxy's underlying target on the `__v_raw` flag, and this is the one shape
// That names it — so `getRawData` can follow the flag without importing vue, and stays usable from vue-free
// Packages like db-schema.
export interface MaybeReactive {
  __v_raw?: unknown;
}
