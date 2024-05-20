<script setup lang="ts">
import { env as clientEnv } from "@/env.client";
import { env as sharedEnv } from "@/env.shared";
import { SITE_DESCRIPTION, SITE_NAME } from "@/services/esposter/constants";

defineSlots<{ default: (props: Record<string, never>) => unknown }>();

const { surface } = useColors();
const logoImageUrl = useLogoImageUrl();

useServerSeoMeta({
  description: SITE_DESCRIPTION,
  fbAppId: sharedEnv.FACEBOOK_CLIENT_ID,
  ogTitle: SITE_NAME,
  ogDescription: SITE_DESCRIPTION,
  ogUrl: clientEnv.NUXT_PUBLIC_BASE_URL,
  ogType: "website",
  ogImage: logoImageUrl,
  ogImageAlt: SITE_NAME,
  ogImageWidth: 250,
  ogImageHeight: 200,
  ogSiteName: SITE_NAME,
  twitterCard: "summary_large_image",
  twitterSite: clientEnv.NUXT_PUBLIC_BASE_URL,
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
