<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";

const { data: session } = await authClient.useSession(useFetch);
useResourceKeyboardShortcuts();
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
        <MessageContentCallPipHost v-if="session" />
        <MessageModelUserSettingsDialog v-if="session" />
        <ResourceSearchDialog v-if="session" />
        <ResourceShortcutsOverlay v-if="session" />
      </v-app>
    </NuxtSEO>
  </NuxtTheme>
</template>
