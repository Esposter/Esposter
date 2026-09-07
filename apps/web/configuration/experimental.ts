import type { NuxtConfig } from "nuxt/schema";

export const experimental: NuxtConfig["experimental"] = {
  // Top-level await marks a component async, making props evaluate to undefined and triggering
  // `[Vue warn]: Invalid prop: type check failed`; asyncContext fixes that.
  asyncContext: true,
  // `typedPages` is deliberately off. It types `params` as a union of every route's params rather than
  // Per-file, and narrowing needs the route name passed at the call site (`useRoute("/foo/[id]")`) — which
  // The generic readers cannot give: `validate` takes any route, and the from-route composables run under
  // Several. Enabling it costs a route-name argument everywhere and buys nothing the guards don't already do
  typescriptPlugin: true,
};
