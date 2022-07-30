<script setup lang="ts">
import { LOGO_IMAGE_URL, SITE_DOMAIN } from "@/util/constants";

// @NOTE: useTheme doesn't work with nuxt ssr
// const { primary } = useGlobalTheme().value.colors;
const { facebookClientId } = useRuntimeConfig();

useHead({
  titleTemplate: (title) => (title ? `Esposter | ${title}` : "Esposter"),
  meta: [
    {
      name: "robots",
      content: "index,follow",
    },
    {
      name: "description",
      content: "Esposter is a nice and casual place for posting random things.",
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:site",
      content: SITE_DOMAIN,
    },
    {
      name: "twitter:creator",
      content: "@jimmy",
    },
    {
      property: "fb:app_id",
      content: facebookClientId,
    },
    {
      property: "og:title",
      content: "Esposter",
    },
    {
      property: "og:description",
      content: "Esposter is a nice and casual place for posting random things.",
    },
    {
      property: "og:url",
      content: SITE_DOMAIN,
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:image",
      content: LOGO_IMAGE_URL,
    },
    {
      property: "og:image:alt",
      content: "logo",
    },
    {
      property: "og:image:width",
      content: "250",
    },
    {
      property: "og:image:height",
      content: "200",
    },
    {
      property: "og:site_name",
      content: SITE_DOMAIN,
    },
    {
      name: "application-name",
      content: "Esposter",
    },
    // {
    //   name: "theme-color",
    //   content: primary,
    // },
    {
      name: "apple-mobile-web-app-capable",
      content: "yes",
    },
    {
      name: "apple-mobile-web-app-status-bar-style",
      content: "default",
    },
    {
      name: "apple-mobile-web-app-title",
      content: "Esposter",
    },
    {
      name: "format-detection",
      content: "telephone=no",
    },
    {
      name: "mobile-web-app-capable",
      content: "yes",
    },
    {
      name: "msapplication-config",
      content: "/browserconfig.xml",
    },
    // {
    //   name: "msapplication-TileColor",
    //   content: primary,
    // },
    {
      name: "msapplication-tap-highlight",
      content: "no",
    },
  ],
  link: [
    {
      rel: "canonical",
      href: SITE_DOMAIN,
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/icons/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/icons/favicon-16x16.png",
    },
    {
      rel: "manifest",
      href: "/manifest.json",
    },
    {
      rel: "mask-icon",
      type: "image/x-icon",
      href: "/favicon.ico",
    },
    {
      rel: "shortcut icon",
      type: "image/x-icon",
      href: "/favicon.ico",
    },
    {
      rel: "apple-touch-icon",
      type: "image/png",
      href: "/icons/apple-icon-180.png",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-2048-2732.jpg",
      media:
        "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-2732-2048.jpg",
      media:
        "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-1668-2388.jpg",
      media:
        "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-2388-1668.jpg",
      media:
        "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-1536-2048.jpg",
      media:
        "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-2048-1536.jpg",
      media:
        "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-1668-2224.jpg",
      media:
        "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-2224-1668.jpg",
      media:
        "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-1620-2160.jpg",
      media:
        "(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-2160-1620.jpg",
      media:
        "(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-1284-2778.jpg",
      media:
        "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-2778-1284.jpg",
      media:
        "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-1170-2532.jpg",
      media:
        "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-2532-1170.jpg",
      media:
        "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-1125-2436.jpg",
      media:
        "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-2436-1125.jpg",
      media:
        "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-1242-2688.jpg",
      media:
        "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-2688-1242.jpg",
      media:
        "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-828-1792.jpg",
      media:
        "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-1792-828.jpg",
      media:
        "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-1242-2208.jpg",
      media:
        "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-2208-1242.jpg",
      media:
        "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-750-1334.jpg",
      media:
        "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-1334-750.jpg",
      media:
        "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-640-1136.jpg",
      media:
        "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: "/icons/apple-splash-1136-640.jpg",
      media:
        "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    },
  ],
  htmlAttrs: { lang: "en" },
});
</script>

<template>
  <slot />
</template>
