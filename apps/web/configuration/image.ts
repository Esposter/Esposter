import type { NuxtConfig } from "nuxt/schema";

// `none` returns every src untouched, so <NuxtImg> is a plain <img> with Nuxt's component API and nothing
// Else. That is the whole reason the module is here: a native `<img>` is in the SSR html and the client tree
// Alike, where an image component gating its render on an IntersectionObserver, which exists only in the
// Browser, renders on the server and not on hydration.
// The default `ipx` provider cannot serve this app's images anyway — the clicker icons resolve through
// `import.meta.glob` to bundled asset urls, which IPX would look for under `public/` and miss in dev.
// The rendered <img> carries a two-entry `srcset` whose entries are the same url, since the provider rewrites
// Nothing and there is no 2x variant to point at. `densities: [1]` does not remove it — it is one fetch either
// Way, so it is left alone rather than configured around.
export const image: NuxtConfig["image"] = { provider: "none" };
