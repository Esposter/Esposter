// @TODO: https://webstatus.dev/features/temporal
// Safari ships no Temporal yet, and neither does any browser on iOS, since every one of them is WebKit. The polyfill
// Leaves a native Temporal alone. Delete this plugin, the chunk worker's import and the dependency once it is Baseline
import "temporal-polyfill/global";

// Constants read Temporal while their module loads, and plugins are imported in `order`, so this sorts ahead of every
// Plugin, Nuxt's own included — the lowest of those is -50
export default defineNuxtPlugin({ order: -100 });
