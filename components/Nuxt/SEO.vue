<script setup lang="ts">
import { SITE_DESCRIPTION, SITE_NAME } from "@/services/esposter/constants";

defineSlots<{ default: (props: {}) => unknown }>();

const { surface } = useColors();
const runtimeConfig = useRuntimeConfig();
const logoImageUrl = useLogoImageUrl();

useServerSeoMeta({
  description: SITE_DESCRIPTION,
  fbAppId: runtimeConfig.public.facebook.clientId,
  ogTitle: SITE_NAME,
  ogDescription: SITE_DESCRIPTION,
  ogUrl: runtimeConfig.public.baseUrl,
  ogType: "website",
  ogImage: logoImageUrl,
  ogImageAlt: SITE_NAME,
  ogImageWidth: 250,
  ogImageHeight: 200,
  ogSiteName: SITE_NAME,
  twitterCard: "summary_large_image",
  twitterSite: runtimeConfig.public.baseUrl,
  applicationName: SITE_NAME,
  themeColor: surface,
  appleMobileWebAppCapable: "yes",
  appleMobileWebAppStatusBarStyle: "default",
  appleMobileWebAppTitle: SITE_NAME,
  formatDetection: "telephone=no",
  mobileWebAppCapable: "yes",
  msapplicationConfig: "/browserconfig.xml",
  msapplicationTileColor: surface,
});

useHead({
  titleTemplate: (title) => (title ? `${SITE_NAME} | ${title}` : SITE_NAME),
});
</script>

<template>
  <slot />
</template>
