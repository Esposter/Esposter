<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { SettingsType } from "@/models/message/room/SettingsType";
import { SettingsContentMap } from "@/services/message/settings/SettingsContentMap";

interface RoomSettingsContentProps {
  roomId: Room["id"];
  settingsType: SettingsType;
}

const { roomId, settingsType } = defineProps<RoomSettingsContentProps>();
const component = computed(() => SettingsContentMap[settingsType]);
</script>

<template>
  <MessageModelSettingsContent>
    <component :is="component" v-if="component" pt-10 :room-id />
  </MessageModelSettingsContent>
</template>
