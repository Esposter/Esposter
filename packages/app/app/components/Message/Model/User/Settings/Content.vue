<script setup lang="ts">
import { UserSettingsContentMap } from "@/services/message/user/settings/UserSettingsContentMap";

interface UserSettingsContentProps {
  settingsType: keyof typeof UserSettingsContentMap;
}

const { settingsType } = defineProps<UserSettingsContentProps>();
const component = computed(() => UserSettingsContentMap[settingsType]);
</script>

<template>
  <MessageModelSettingsContent>
    <component :is="component" v-if="component" pt-10 />
  </MessageModelSettingsContent>
</template>
