<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { SettingsContentMap } from "@/services/message/settings/SettingsContentMap";

interface Props {
  room: RoomInMessage;
  settingsType: keyof typeof SettingsContentMap;
}

const { room, settingsType } = defineProps<Props>();
const emit = defineEmits<{ close: []; "open:drawer": [] }>();
const component = computed(() => SettingsContentMap[settingsType]);
</script>

<template>
  <MessageModelSettingsContent>
    <template #header>
      <MessageModelSettingsHeader :title="settingsType" @close="emit('close')" @open:drawer="emit('open:drawer')" />
    </template>
    <!-- Timeout 0 shows the skeleton on every tab switch instead of keeping the stale panel -->
    <Suspense v-if="component" :timeout="0">
      <component :is="component" :room />
      <template #fallback>
        <MessageModelSettingsSkeleton />
      </template>
    </Suspense>
  </MessageModelSettingsContent>
</template>
