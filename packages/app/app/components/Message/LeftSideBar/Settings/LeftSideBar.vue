<script setup lang="ts">
import { SettingsType } from "@/models/message/settings/SettingsType";
import { useSettingsStore } from "@/store/message/settings";

const settingsStore = useSettingsStore();
const { settingsType } = storeToRefs(settingsStore);
</script>

<template>
  <v-navigation-drawer b-r-1 location="left" rail permanent>
    <v-list density="compact">
      <v-list-item :active="settingsType === SettingsType.Webhook" @click="settingsType = SettingsType.Webhook">
        <template #prepend>
          <v-avatar color="background">
            <v-icon icon="mdi-webhook" />
          </v-avatar>
        </template>
        <v-list-item-title font-bold>Webhook</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
