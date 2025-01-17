import type { NuxtConfig } from "nuxt/schema";

import { ICONS_PUBLIC_FOLDER_PATH, SITE_NAME } from "../shared/services/esposter/constants";

export const pwa: NuxtConfig["pwa"] = {
  manifest: {
    icons: [
      {
        purpose: "maskable any",
        sizes: "192x192",
        src: `${ICONS_PUBLIC_FOLDER_PATH}/manifest-icon-192.png`,
        type: "image/png",
      },
      {
        purpose: "maskable any",
        sizes: "512x512",
        src: `${ICONS_PUBLIC_FOLDER_PATH}/manifest-icon-512.png`,
        type: "image/png",
      },
    ],
    name: SITE_NAME,
    orientation: "portrait",
    short_name: SITE_NAME,
    start_url: "/",
  },
};
