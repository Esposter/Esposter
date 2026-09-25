<script setup lang="ts">
import { PAGE_TITLE_SEPARATOR, SITE_DESCRIPTION } from "#shared/services/app/constants";
import { UiToken } from "@/models/ui/UiToken";
import { ResolvedThemeModes } from "@/models/vuetify/ResolvedThemeMode";
import { useUiStyleStore } from "@/store/ui/style";
import { UiPaletteMap } from "@@/configuration/UiPaletteMap";
import { SITE_NAME } from "@esposter/shared";

useHead({
  titleTemplate: (title) => (title ? `${SITE_NAME}${PAGE_TITLE_SEPARATOR}${title}` : SITE_NAME),
});
defineSlots<{ default: () => VNode }>();
const runtimeConfig = useRuntimeConfig();
const uiStyleStore = useUiStyleStore();
const { uiStyle } = storeToRefs(uiStyleStore);
// The browser's chrome takes the panel of whichever mode the system asks for, as the tokens do on first paint
const themeColor = computed(() =>
  ResolvedThemeModes.map((themeMode) => ({
    content: UiPaletteMap[uiStyle.value][themeMode][UiToken.Panel],
    media: `(prefers-color-scheme: ${themeMode})`,
  })),
);
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
  // Only the og tags @nuxtjs/seo cannot derive belong here: it resolves the rest, per route, off the canonical
  // Url, the site config, the title template and the description above
  ogImage: logoImageUrl,
  ogImageAlt: SITE_NAME,
  ogImageHeight: 200,
  ogImageWidth: 250,
  themeColor,
  // `nuxt-og-image` emits `twitter:card` only for an image declared through `defineOgImage`, and `zeroRuntime`
  // Strips even that, so the tag is ours to set or X renders no card at all. `twitter:site` stays unset because
  // It names an @handle, which this site has no account to fill
  twitterCard: "summary_large_image",
});
</script>

<template>
  <slot />
</template>
