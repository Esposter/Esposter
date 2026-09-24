<script setup lang="ts">
import { NotificationsSettingsSection } from "@/models/message/user/settings/NotificationsSettingsSection";
import { useUserSettingsStore } from "@/store/message/user/settings";

const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
</script>

<template>
  <MessageModelUserSettingsSection v-if="userSettings" :title="NotificationsSettingsSection.IdleTimeout">
    <MessageModelUserSettingsTypeNotificationsIdleTimeoutSlider :user-settings />
  </MessageModelUserSettingsSection>
  <MessageModelSettingsSkeleton v-else />
</template>
