import type { NuxtConfig } from "nuxt/schema";

import { PWA_PUBLIC_FOLDER_PATH } from "../shared/services/app/constants";

export const app: NuxtConfig["app"] = {
  head: {
    htmlAttrs: { lang: "en" },
    link: [
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/favicon-196.png`,
        rel: "icon",
        sizes: "196x196",
        type: "image/png",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-icon-180.png`,
        rel: "apple-touch-icon",
        type: "image/png",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-2048-2732.jpg`,
        media:
          "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-2732-2048.jpg`,
        media:
          "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-1668-2388.jpg`,
        media:
          "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-2388-1668.jpg`,
        media:
          "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-1536-2048.jpg`,
        media:
          "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-2048-1536.jpg`,
        media:
          "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-1488-2266.jpg`,
        media:
          "(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-2266-1488.jpg`,
        media:
          "(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-1640-2360.jpg`,
        media:
          "(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-2360-1640.jpg`,
        media:
          "(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-1668-2224.jpg`,
        media:
          "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-2224-1668.jpg`,
        media:
          "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-1620-2160.jpg`,
        media:
          "(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-2160-1620.jpg`,
        media:
          "(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-1320-2868.jpg`,
        media:
          "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-2868-1320.jpg`,
        media:
          "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-1206-2622.jpg`,
        media:
          "(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-2622-1206.jpg`,
        media:
          "(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-1290-2796.jpg`,
        media:
          "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-2796-1290.jpg`,
        media:
          "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-1179-2556.jpg`,
        media:
          "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-2556-1179.jpg`,
        media:
          "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-1284-2778.jpg`,
        media:
          "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-2778-1284.jpg`,
        media:
          "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-1170-2532.jpg`,
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-2532-1170.jpg`,
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-1125-2436.jpg`,
        media:
          "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-2436-1125.jpg`,
        media:
          "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-1242-2688.jpg`,
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-2688-1242.jpg`,
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-828-1792.jpg`,
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-1792-828.jpg`,
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-1242-2208.jpg`,
        media:
          "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-2208-1242.jpg`,
        media:
          "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-750-1334.jpg`,
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-1334-750.jpg`,
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-640-1136.jpg`,
        media:
          "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
        rel: "apple-touch-startup-image",
      },
      {
        href: `${PWA_PUBLIC_FOLDER_PATH}/apple-splash-1136-640.jpg`,
        media:
          "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
        rel: "apple-touch-startup-image",
      },
    ],
    script: [
      {
        src: "/sbaPolyfill.js",
      },
    ],
    // Vuetify v4 theme composable injects `@layer vuetify-utilities { ... }` as a dynamic
    // <style> tag at runtime (head.push, priority 100). Without this declaration, that style
    // Is the first CSS the browser sees, placing vuetify-utilities before vuetify-core in the
    // Cascade layer order — giving utilities lower priority than core (wrong).
    // By injecting the full layer ordering at critical priority (-2), we ensure the correct
    // Order: vuetify-core < vuetify-components < vuetify-overrides < vuetify-utilities < vuetify-final
    // See: vuetify/lib/composables/theme.js and vuetify/lib/styles/generic/_layers.scss
    style: [
      {
        id: "vuetify-layer-order",
        // Match exactly what _layers.scss declares so sub-layer order is also preserved
        innerHTML:
          "@layer vuetify-core { @layer reset, base; } @layer vuetify-components; @layer vuetify-overrides; @layer vuetify-utilities { @layer theme-base; @layer typography; @layer helpers; @layer theme-background; @layer theme-foreground; } @layer vuetify-final { @layer transitions, trumps; }",
        tagPriority: "critical",
      },
    ],
  },
};
