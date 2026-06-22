<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { SettingsContentMap } from "@/services/message/settings/SettingsContentMap";

interface RoomSettingsContentProps {
  room: RoomInMessage;
  settingsType: keyof typeof SettingsContentMap;
}

const { room, settingsType } = defineProps<RoomSettingsContentProps>();
const emit = defineEmits<{ close: [] }>();
const component = computed(() => SettingsContentMap[settingsType]);
</script>

<template>
  <MessageModelSettingsContent>
    <header mb-4 pb-4 bg-surface flex items-center top-0 justify-between sticky z-1>
      <div font-bold text-headline-medium>{{ settingsType }}</div>
      <v-btn icon="mdi-close" variant="text" @click="emit('close')" />
    </header>
    <component :is="component" v-if="component" :room />
  </MessageModelSettingsContent>
</template>
