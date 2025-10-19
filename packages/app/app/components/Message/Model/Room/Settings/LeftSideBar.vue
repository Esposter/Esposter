<script setup lang="ts">
import { SettingsListItemMap } from "@/services/message/settings/SettingsListItemMap";
import { useSettingsStore } from "@/store/message/room/settings";

const settingsStore = useSettingsStore();
const { settingsType } = storeToRefs(settingsStore);
</script>

<template>
  <MessageModelSettingsLeftSideBar>
    <v-list pt-10>
      <v-list-item
        v-for="[type, { icon }] of Object.entries(SettingsListItemMap)"
        :key="type"
        :active="type === settingsType"
        @click="settingsType = type"
      >
        <template #prepend>
          <v-icon :icon />
        </template>
        <v-list-item-title font-bold>{{ settingsType }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </MessageModelSettingsLeftSideBar>
</template>
