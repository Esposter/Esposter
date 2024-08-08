import type { NuxtConfig } from "nuxt/schema";

export const pwa: NuxtConfig["pwa"] = {
  manifest: {
    background_color: "#fff",
    description: "A nice and casual place for posting random things.",
    display: "standalone",
    icons: [
      {
        purpose: "maskable any",
        sizes: "192x192",
        src: "/icons/manifest-icon-192.png",
        type: "image/png",
      },
      {
        purpose: "maskable any",
        sizes: "512x512",
        src: "/icons/manifest-icon-512.png",
        type: "image/png",
      },
    ],
    name: "Esposter",
    orientation: "portrait",
    short_name: "Esposter",
    start_url: "/",
    theme_color: "#fff",
  },
};
