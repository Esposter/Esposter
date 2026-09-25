import type { NuxtConfig } from "nuxt/schema";

import { ThemeMode } from "../app/models/ui/ThemeMode";
import { UiToken } from "../app/models/ui/UiToken";
import { PWA_PUBLIC_FOLDER_PATH, SITE_DESCRIPTION, SITE_NAME } from "../shared/services/app/constants";
import { UiPaletteMap } from "./UiPaletteMap";
import { DEFAULT_UI_STYLE } from "./UiStyleMap";
// A manifest holds one colour of each, so an install's splash and title bar take the default style's light palette: the
// Page's ground behind the splash and the panel the address bar takes, as the theme colour meta tag does (`NuxtSEO`)
const manifestPalette = UiPaletteMap[DEFAULT_UI_STYLE][ThemeMode.Light];

export const pwa: NuxtConfig["pwa"] = {
  manifest: {
    background_color: manifestPalette[UiToken.Background],
    description: SITE_DESCRIPTION,
    display: "standalone",
    icons: [
      {
        purpose: "any",
        sizes: "192x192",
        src: `${PWA_PUBLIC_FOLDER_PATH}/manifest-icon-192.maskable.png`,
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "192x192",
        src: `${PWA_PUBLIC_FOLDER_PATH}/manifest-icon-192.maskable.png`,
        type: "image/png",
      },
      {
        purpose: "any",
        sizes: "512x512",
        src: `${PWA_PUBLIC_FOLDER_PATH}/manifest-icon-512.maskable.png`,
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "512x512",
        src: `${PWA_PUBLIC_FOLDER_PATH}/manifest-icon-512.maskable.png`,
        type: "image/png",
      },
    ],
    name: SITE_NAME,
    orientation: "portrait",
    short_name: SITE_NAME,
    start_url: "/",
    theme_color: manifestPalette[UiToken.Panel],
  },
  workbox: { importScripts: ["/serviceWorker/push.js"] },
};
