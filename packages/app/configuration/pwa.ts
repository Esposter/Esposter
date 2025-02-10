import type { NuxtConfig } from "nuxt/schema";

import { SITE_DESCRIPTION, SITE_NAME } from "../shared/services/esposter/constants";

export const pwa: NuxtConfig["pwa"] = {
  manifest: {
    background_color: "#fff",
    description: SITE_DESCRIPTION,
    display: "standalone",
    icons: [
      {
        purpose: "any",
        sizes: "192x192",
        src: "manifest-icon-192.maskable.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "192x192",
        src: "manifest-icon-192.maskable.png",
        type: "image/png",
      },
      {
        purpose: "any",
        sizes: "512x512",
        src: "manifest-icon-512.maskable.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "512x512",
        src: "manifest-icon-512.maskable.png",
        type: "image/png",
      },
    ],
    name: SITE_NAME,
    orientation: "portrait",
    short_name: SITE_NAME,
    start_url: "/",
    theme_color: "#fff",
  },
};
