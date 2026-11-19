<script setup lang="ts">
import { VoiceSettingsSections } from "#src/models/message/user/settings/VoiceSettingsSection";
import { VoiceSettingsCardMap } from "#src/services/message/user/settings/VoiceSettingsCardMap";
import { useUserSettingsStore } from "#src/store/message/user/settings/index";

const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
</script>

<template>
  <template v-if="userSettings">
    <MessageModelUserSettingsSection v-for="section of VoiceSettingsSections" :key="section" :title="section">
      <component :is="VoiceSettingsCardMap[section]" :user-settings />
    </MessageModelUserSettingsSection>
  </template>
  <MessageModelSettingsSkeleton v-else />
</template>
