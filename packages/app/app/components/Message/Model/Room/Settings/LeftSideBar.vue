<script setup lang="ts">
import { SettingsType } from "@/models/message/room/SettingsType";
import { SettingsListItemMap } from "@/services/message/settings/SettingsListItemMap";

const modelValue = defineModel<SettingsType>({ required: true });
const emit = defineEmits<{ openDelete: [] }>();
</script>

<template>
  <MessageModelSettingsLeftSideBar>
    <v-list pt-10>
      <v-list-item
        v-for="[settingsType, { color, icon }] of Object.entries(SettingsListItemMap)"
        :key="settingsType"
        :active="settingsType === modelValue"
        :base-color="color"
        @click="settingsType === SettingsType.Delete ? emit('openDelete') : (modelValue = settingsType)"
      >
        <template #prepend>
          <v-icon :icon />
        </template>
        <v-list-item-title font-bold>{{ settingsType }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </MessageModelSettingsLeftSideBar>
</template>
