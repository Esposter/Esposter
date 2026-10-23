import type { NuxtConfig } from "nuxt/schema";

import { ThemeMode } from "../app/models/ui/ThemeMode.ts";
import { UiToken } from "../app/models/ui/UiToken.ts";
import { PWA_PUBLIC_FOLDER_PATH, SITE_DESCRIPTION, SITE_NAME } from "../shared/services/app/constants.ts";
import { DEFAULT_UI_STYLE } from "./constants.ts";
import { UiPaletteMap } from "./UiPaletteMap.ts";

// A manifest holds one colour of each, so an install's splash and title bar take the default style's light palette: the
// Page's ground behind the splash and the panel the address bar takes, as the theme colour meta tag does (`NuxtSEO`)
const manifestPalette = UiPaletteMap[DEFAULT_UI_STYLE][ThemeMode.Light];

export const pwa: NuxtConfig["pwa"] = {
  client: {
    // Checks for a new worker hourly, so a tab left open for days is offered the update rather than only one on
    // Navigation
    periodicSyncForUpdates: 3600,
    registerPlugin: true,
  },
  // The service worker is TypeScript in `service-worker/`, built by the module with its precache list injected
  filename: "sw.ts",
  manifest: {
    background_color: manifestPalette[UiToken.Background],
    description: SITE_DESCRIPTION,
    display: "standalone",
    icons: [
      // The artwork is unpadded and transparent, which is how the "any" purpose wants it
      { purpose: "any", sizes: "192x192", src: `${PWA_PUBLIC_FOLDER_PATH}/manifest-icon-192.png`, type: "image/png" },
      // A maskable icon is drawn on a solid fill with the mark inside the 80% safe zone, so no mask can crop it
      {
        purpose: "maskable",
        sizes: "192x192",
        src: `${PWA_PUBLIC_FOLDER_PATH}/manifest-icon-192.maskable.png`,
        type: "image/png",
      },
      { purpose: "any", sizes: "512x512", src: `${PWA_PUBLIC_FOLDER_PATH}/manifest-icon-512.png`, type: "image/png" },
      {
        purpose: "maskable",
        sizes: "512x512",
        src: `${PWA_PUBLIC_FOLDER_PATH}/manifest-icon-512.maskable.png`,
        type: "image/png",
      },
    ],
    id: "/",
    lang: "en",
    name: SITE_NAME,
    short_name: SITE_NAME,
    start_url: "/",
    theme_color: manifestPalette[UiToken.Panel],
  },
  // A new worker waits until the reader takes the update, since a reload mid-call or mid-message would lose it. The
  // Update toast in `ToastStack` is that choice
  registerType: "prompt",
  srcDir: "service-worker",
  strategies: "injectManifest",
};
