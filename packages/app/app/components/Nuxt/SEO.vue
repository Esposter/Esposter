<script setup lang="ts">
import { SITE_DESCRIPTION, SITE_NAME } from "#shared/services/app/constants";
import { getLogoImageUrl } from "@/services/app/getLogoImageUrl";

defineSlots<{ default: (props: Record<string, never>) => unknown }>();

useHead({
  titleTemplate: (title) => (title ? `${SITE_NAME} | ${title}` : SITE_NAME),
});
const { surface } = useColors();
const runtimeConfig = useRuntimeConfig();
const logoImageUrl = getLogoImageUrl();
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
  ogDescription: SITE_DESCRIPTION,
  ogImage: logoImageUrl,
  ogImageAlt: SITE_NAME,
  ogImageHeight: 200,
  ogImageWidth: 250,
  ogSiteName: SITE_NAME,
  ogTitle: SITE_NAME,
  ogType: "website",
  ogUrl: runtimeConfig.public.baseUrl,
  themeColor: surface,
  twitterCard: "summary_large_image",
  twitterSite: runtimeConfig.public.baseUrl,
});
</script>

<template>
  <slot />
</template>
