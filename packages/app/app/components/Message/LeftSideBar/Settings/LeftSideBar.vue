<script setup lang="ts">
import { SettingsListItemMap } from "@/services/message/settings/SettingsListItemMap";
import { useSettingsStore } from "@/store/message/settings";

const settingsStore = useSettingsStore();
const { settingsType } = storeToRefs(settingsStore);
</script>

<template>
  <v-navigation-drawer location="left" permanent>
    <v-list pt-10 density="compact">
      <v-list-item
        v-for="[type, { icon }] of Object.entries(SettingsListItemMap)"
        :key="type"
        :active="type === settingsType"
        @click="settingsType = type"
      >
        <v-list-item-title font-bold>{{ settingsType }}</v-list-item-title>
        <template #append>
          <v-icon :icon />
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
