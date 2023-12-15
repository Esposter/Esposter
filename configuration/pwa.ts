import { type NuxtConfig } from "nuxt/schema";

export const pwa: NuxtConfig["pwa"] = {
  manifest: {
    name: "Esposter",
    short_name: "Esposter",
    description: "A nice and casual place for posting random things.",
    icons: [
      {
        src: "/icons/manifest-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icons/manifest-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable any",
      },
    ],
    theme_color: "#fff",
    background_color: "#fff",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
  },
};
