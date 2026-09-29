<script setup lang="ts">
import { PAGE_TITLE_SEPARATOR, SITE_DESCRIPTION } from "#shared/services/app/constants";
import { ResolvedThemeModes } from "@/models/ui/ResolvedThemeMode";
import { ThemeMode } from "@/models/ui/ThemeMode";
import { UiToken } from "@/models/ui/UiToken";
import { useUiStyleStore } from "@/store/ui/style";
import { useThemeModeStore } from "@/store/ui/themeMode";
import { UiPaletteMap } from "@@/configuration/UiPaletteMap";
import { SITE_NAME } from "@esposter/shared";

useHead({ titleTemplate: (title) => (title ? `${SITE_NAME}${PAGE_TITLE_SEPARATOR}${title}` : SITE_NAME) });
defineSlots<{ default: () => VNode }>();
const runtimeConfig = useRuntimeConfig();
const uiStyleStore = useUiStyleStore();
const { uiStyle } = storeToRefs(uiStyleStore);
const themeModeStore = useThemeModeStore();
const { resolvedThemeMode, themeMode } = storeToRefs(themeModeStore);
// The browser's chrome takes the panel of the reader's mode, or of whichever the system asks for, as the tokens do on
// First paint
const themeColor = computed(() =>
  themeMode.value === ThemeMode.System
    ? ResolvedThemeModes.map((resolvedThemeModeValue) => ({
        content: UiPaletteMap[uiStyle.value][resolvedThemeModeValue][UiToken.Panel],
        media: `(prefers-color-scheme: ${resolvedThemeModeValue})`,
      }))
    : UiPaletteMap[uiStyle.value][resolvedThemeMode.value][UiToken.Panel],
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
});
</script>

<template>
  <slot />
</template>
