<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";

const { data: session } = await authClient.useSession(useFetch);
const { currentRoute } = useRouter();
</script>

<template>
  <NuxtPwaAssets />
  <NuxtTheme>
    <NuxtSEO>
      <v-app>
        <!-- An immersive page is a place of its own and brings its own way back, so it takes neither the app bar nor -->
        <!-- The progress bar that runs along the app bar's bottom edge -->
        <template v-if="currentRoute.meta.layout !== 'immersive'">
          <AppBar />
          <AppLoadingIndicator />
        </template>
        <NuxtPage />
        <StyledAlertList />
        <StyledClipboardSnackbar />
        <AppNotificationSnackbar v-if="session" />
        <AchievementNotificationSnackBarList v-if="session" />
        <MessageContentCallPictureInPictureHost v-if="session" />
        <MessageModelUserSettingsDialog v-if="session" />
      </v-app>
    </NuxtSEO>
  </NuxtTheme>
</template>
