<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { SettingsContentMap } from "@/services/message/settings/SettingsContentMap";

interface RoomSettingsContentProps {
  roomId: RoomInMessage["id"];
  settingsType: keyof typeof SettingsContentMap;
}

const { roomId, settingsType } = defineProps<RoomSettingsContentProps>();
const component = computed(() => SettingsContentMap[settingsType]);
</script>

<template>
  <MessageModelSettingsContent>
    <component :is="component" v-if="component" pt-10 :room-id />
  </MessageModelSettingsContent>
</template>
