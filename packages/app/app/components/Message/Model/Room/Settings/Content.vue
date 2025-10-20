<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { SettingsType } from "@/models/message/room/SettingsType";
import { SettingsContentMap } from "@/services/message/settings/SettingsContentMap";

interface RoomSettingsContentProps {
  roomId: Room["id"];
  settingsType: SettingsType;
}

const { roomId, settingsType } = defineProps<RoomSettingsContentProps>();
</script>

<template>
  <MessageModelSettingsContent>
    <component :is="SettingsContentMap[settingsType]" pt-10 :room-id />
  </MessageModelSettingsContent>
</template>
