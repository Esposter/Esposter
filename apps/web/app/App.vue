<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { useLayoutStore } from "@/store/layout";
import { useReadableTextStore } from "@/store/ui/readableText";

const { currentRoute } = useRouter();
const layoutStore = useLayoutStore();
const { isFooterFocused } = storeToRefs(layoutStore);
const readableTextStore = useReadableTextStore();
const { isReadableText } = storeToRefs(readableTextStore);
// On the root, so the one token swap reaches every page, and in the first response, so the page never paints in the
// Other face before hydration
useHead({ htmlAttrs: { "data-readable-text": () => (isReadableText.value ? "" : undefined) } });
const { data: session } = await authClient.useSession(useFetch);
// An immersive page is a place of its own and brings its own way back, so it takes neither the dock nor the room
// The dock would take from it
const isDockShown = computed(() => currentRoute.value.meta.layout !== "immersive");
// Where the dock sits at this width, for every fixed region to start past it: the bottom bar on a narrow screen,
// Unless the page's composer has the keyboard, and the left rail on a wide one
const dockInsetClass = computed(() => {
  if (!isDockShown.value) return undefined;
  else if (isFooterFocused.value) return "md:[--dock-inset-inline-start:var(--dock-size)]";
  else
    return "[--dock-inset-block-end:var(--dock-size)] md:[--dock-inset-block-end:0rem] md:[--dock-inset-inline-start:var(--dock-size)]";
});
</script>

<template>
  <NuxtPwaAssets />
  <NuxtTheme>
    <NuxtSEO>
      <v-app :class="dockInsetClass">
        <template v-if="isDockShown">
          <AppDock />
          <AppLoadingIndicator />
        </template>
        <NuxtPage />
        <AppToastStack />
        <UiContextMenuHost />
        <AppCommandPalette />
        <AppShortcutsDialog />
        <MessageContentCallPictureInPictureHost v-if="session" />
        <MessageModelUserSettingsDialog v-if="session" />
      </v-app>
    </NuxtSEO>
  </NuxtTheme>
</template>
