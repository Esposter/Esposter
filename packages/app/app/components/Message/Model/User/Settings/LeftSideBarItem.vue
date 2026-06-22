<script setup lang="ts">
import type { UserSettingsType } from "@/models/message/user/UserSettingsType";

interface UserSettingsLeftSideBarItemProps {
  color?: string;
  icon: string;
  isActive: boolean;
  settingsType: UserSettingsType;
}

const { color, icon, isActive, settingsType } = defineProps<UserSettingsLeftSideBarItemProps>();
const emit = defineEmits<{ click: [settingsType: UserSettingsType] }>();
</script>

<template>
  <v-list-item :active="isActive" :base-color="color" @click="emit('click', settingsType)">
    <template #prepend>
      <v-icon :icon />
    </template>
    <v-list-item-title font-bold>{{ settingsType }}</v-list-item-title>
  </v-list-item>
</template>
