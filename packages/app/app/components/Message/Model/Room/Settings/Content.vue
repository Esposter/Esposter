<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { SettingsContentMap } from "@/services/message/settings/SettingsContentMap";

interface RoomSettingsContentProps {
  room: RoomInMessage;
  settingsType: keyof typeof SettingsContentMap;
}

const { room, settingsType } = defineProps<RoomSettingsContentProps>();
const emit = defineEmits<{ close: []; "open:drawer": [] }>();
const { smAndDown } = useVDisplay();
const component = computed(() => SettingsContentMap[settingsType]);
</script>

<template>
  <MessageModelSettingsContent>
    <v-sheet tag="header" mb-4 pb-4 flex items-center top-0 justify-between sticky z-1>
      <div flex gap-2 items-center>
        <StyledTooltipIconButton v-if="smAndDown" icon="mdi-menu" text="Show menu" @click="emit('open:drawer')" />
        <div font-bold text-headline-medium>{{ settingsType }}</div>
      </div>
      <v-tooltip text="Close">
        <template #activator="{ props: tooltipProps }">
          <v-btn :="tooltipProps" icon="mdi-close" variant="text" @click="emit('close')" />
        </template>
      </v-tooltip>
    </v-sheet>
    <!-- Timeout 0 shows the skeleton on every tab switch instead of keeping the stale panel -->
    <Suspense v-if="component" :timeout="0">
      <component :is="component" :room />
      <template #fallback>
        <MessageModelSettingsSkeleton />
      </template>
    </Suspense>
  </MessageModelSettingsContent>
</template>
