<script setup lang="ts">
import { SettingsType } from "@/models/message/room/SettingsType";

interface RoomSettingsLeftSideBarItemProps {
  color?: string;
  icon: string;
  isActive: boolean;
  settingsType: SettingsType;
}

const { color, icon, isActive, settingsType } = defineProps<RoomSettingsLeftSideBarItemProps>();
const emit = defineEmits<{ click: [settingsType: SettingsType] }>();
</script>

<template>
  <v-list-item :active="isActive" :base-color="color" @click="emit('click', settingsType)">
    <template #prepend>
      <v-icon :icon />
    </template>
    <v-list-item-title font-bold>{{ settingsType }}</v-list-item-title>
  </v-list-item>
</template>
