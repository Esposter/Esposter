import { UiStyle } from "#src/models/ui/UiStyle";

// Where Nitro serves the Temporal polyfill from its own install and where the document head loads it. Two configs
// Name the one path, and a head script pointed anywhere else is a 404 only a browser without Temporal ever sees
export const TEMPORAL_POLYFILL_BASE_URL = "polyfills/temporal";
// How much of the accent standard's tonal button mixes over whatever it sits on. The palette test composes the same
// Mix over every surface to hold its label at AA
export const STANDARD_TONAL_MIX_PERCENTAGE = 12;
// The folder under the build assets where a game's or 3D engine's bundled files are named, since the engine loads them by
// URL at runtime. `vite.ts` names the app's `dungeons` (Phaser) and `visual` (three.js) assets there, and the service
// Worker's precache leaves the folder out (`pwa.ts`)
export const ENGINE_ASSETS_DIRECTORY = "engine";
// The style a reader with no cookie gets
export const DEFAULT_UI_STYLE = UiStyle.Standard;
// RealtimeKit's assets host: the virtual background's segmentation model and the wasm its glue loads, which the
// Security config allows under both script and connect sources
export const REALTIME_ASSETS_URL = "https://rtk-assets.realtime.cloudflare.com";
// Cloudflare Web Analytics: the beacon script the edge injects, and the endpoint it reports to
export const CLOUDFLARE_INSIGHTS_BEACON_URL = "https://static.cloudflareinsights.com";
export const CLOUDFLARE_INSIGHTS_URL = "https://cloudflareinsights.com";
// The inline handler that @nuxt/image's NuxtImg and NuxtPicture render on every image on the server, which records an
// Image that failed before hydration. The security config allows this exact string by its hash, and its test reads the
// Module's components for the string, so an upgrade that rewords it fails the test rather than the page
export const NUXT_IMAGE_ERROR_HANDLER = "this.setAttribute('data-error', 1)";
