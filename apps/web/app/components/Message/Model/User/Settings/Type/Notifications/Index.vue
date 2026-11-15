<script setup lang="ts">
import { NotificationsSettingsSection } from "#src/models/message/user/settings/NotificationsSettingsSection";
import { useUserSettingsStore } from "#src/store/message/user/settings/index";

const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
</script>

<template>
  <MessageModelUserSettingsSection v-if="userSettings" :title="NotificationsSettingsSection.IdleTimeout">
    <MessageModelUserSettingsTypeNotificationsIdleTimeoutSlider :user-settings />
  </MessageModelUserSettingsSection>
  <MessageModelSettingsSkeleton v-else />
</template>
