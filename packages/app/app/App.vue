<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";

const { data: session } = await authClient.useSession(useFetch);
</script>

<template>
  <NuxtPwaAssets />
  <NuxtTheme>
    <NuxtSEO>
      <v-app>
        <AppBar />
        <AppLoadingIndicator />
        <NuxtPage />
        <StyledAlertList />
        <AchievementNotificationSnackBarList v-if="session" />
      </v-app>
    </NuxtSEO>
  </NuxtTheme>
</template>

<style lang="scss">
// Only show scrollbar when content actually exceeds screen height
html {
  overflow-y: auto;
}

// Maintain height for line breaks as tiptap editor inserts empty <p> tag for newlines
p:empty::before {
  content: "";
  display: inline-block;
}

// Canvas by default is an inline element and can cause vertical scrollbar to appear
// https://stackoverflow.com/questions/37765215/canvas-dimensions-cause-a-vertical-scroll-bar-to-appear
canvas {
  display: block;
}
// three.js profiler blocks the app menus since it is set to z-index 9999
#profiler-mini-panel {
  z-index: 0 !important;
}
</style>
