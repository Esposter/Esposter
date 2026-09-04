<script setup lang="ts">
import type { SettingsType } from "@/models/message/room/SettingsType";

interface Props {
  color?: string;
  icon: string;
  isActive: boolean;
  settingsType: SettingsType;
  // The panel's own name is its title everywhere but the destructive row, which says what it does to *this*
  // Reader: the owner deletes the room, everyone else leaves it
  title?: string;
}

const { color, icon, isActive, settingsType, title } = defineProps<Props>();
const emit = defineEmits<{ click: [settingsType: SettingsType] }>();
</script>

<template>
  <v-list-item :active="isActive" :base-color="color" @click="emit('click', settingsType)">
    <template #prepend>
      <v-icon :icon />
    </template>
    <v-list-item-title font-bold>{{ title ?? settingsType }}</v-list-item-title>
  </v-list-item>
</template>
