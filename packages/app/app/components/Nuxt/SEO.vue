<script setup lang="ts">
import { SITE_DESCRIPTION } from "#shared/services/app/constants";
import { useColorsStore } from "@/store/colors";
import { SITE_NAME } from "@esposter/shared";

useHead({
  titleTemplate: (title) => (title ? `${SITE_NAME} | ${title}` : SITE_NAME),
});
defineSlots<{ default: () => VNode }>();
const runtimeConfig = useRuntimeConfig();
const colorsStore = useColorsStore();
const { surface } = storeToRefs(colorsStore);
const logoImageUrl = useLogoImageUrl();
useSeoMeta({
  appleMobileWebAppCapable: "yes",
  appleMobileWebAppStatusBarStyle: "default",
  appleMobileWebAppTitle: SITE_NAME,
  applicationName: SITE_NAME,
  description: SITE_DESCRIPTION,
  fbAppId: runtimeConfig.public.facebook.clientId,
  formatDetection: "telephone=no",
  mobileWebAppCapable: "yes",
  msapplicationConfig: "/browserconfig.xml",
  msapplicationTileColor: surface,
  // Only the og tags @nuxtjs/seo cannot derive belong here. It resolves og:url from the canonical url of the
  // Route, og:site_name from the site config, and og:type, and it infers og:title and og:description from the
  // Title template and the description above — restating any of them pinned every page's unfurl to the site
  // Root. It also pushes `twitter:card: summary_large_image`, which is the one twitter tag worth having: an
  // @handle for `twitter:site` is rejected outright when the site has no account to name
  ogImage: logoImageUrl,
  ogImageAlt: SITE_NAME,
  ogImageHeight: 200,
  ogImageWidth: 250,
  themeColor: surface,
});
</script>

<template>
  <slot />
</template>
