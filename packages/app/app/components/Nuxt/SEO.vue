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
  // Only the og tags @nuxtjs/seo cannot derive belong here: it resolves the rest, per route, off the canonical
  // Url, the site config, the title template and the description above
  ogImage: logoImageUrl,
  ogImageAlt: SITE_NAME,
  ogImageHeight: 200,
  ogImageWidth: 250,
  themeColor: surface,
  // `nuxt-og-image` emits `twitter:card` only for an image declared through `defineOgImage`, and `zeroRuntime`
  // Strips even that, so the tag is ours to set or X renders no card at all. `twitter:site` stays unset because
  // It names an @handle, which this site has no account to fill
  twitterCard: "summary_large_image",
});
</script>

<template>
  <slot />
</template>
