<script setup lang="ts">
import { useUserSettingsStore } from "@/store/message/user/settings";

const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
</script>

<template>
  <v-container v-if="userSettings" fluid>
    <div font-bold mb-4 text-title-medium>Notifications</div>
    <MessageModelUserSettingsTypeNotificationsIdleTimeoutSlider :user-settings />
  </v-container>
</template>
