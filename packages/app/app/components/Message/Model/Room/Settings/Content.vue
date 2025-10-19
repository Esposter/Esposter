<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { SettingsContentMap } from "@/services/message/settings/SettingsContentMap";
import { useSettingsStore } from "@/store/message/room/settings";

const settingsStore = useSettingsStore();
const { settingsType } = storeToRefs(settingsStore);

interface RoomSettingsContentProps {
  roomId: Room["id"];
}

const { roomId } = defineProps<RoomSettingsContentProps>();
</script>

<template>
  <MessageModelSettingsContent>
    <component :is="SettingsContentMap[settingsType]" pt-10 :room-id />
  </MessageModelSettingsContent>
</template>
