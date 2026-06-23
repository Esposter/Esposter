<script setup lang="ts">
import { NotificationsSettingsSection } from "@/models/message/user/settings/NotificationsSettingsSection";
import { useUserSettingsStore } from "@/store/message/user/settings";

const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
</script>

<template>
  <template v-if="userSettings">
    <MessageModelUserSettingsSection :title="NotificationsSettingsSection.IdleTimeout">
      <MessageModelUserSettingsTypeNotificationsIdleTimeoutSlider :user-settings />
    </MessageModelUserSettingsSection>
  </template>
</template>
