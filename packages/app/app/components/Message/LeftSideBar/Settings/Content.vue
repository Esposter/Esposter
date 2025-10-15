<script setup lang="ts">
import { SettingsContentMap } from "@/services/message/settings/SettingsContentMap";
import { useSettingsStore } from "@/store/message/settings";

const settingsStore = useSettingsStore();
const { settingsType } = storeToRefs(settingsStore);
</script>

<template>
  <v-main h-dvh>
    <v-container class="bg-surface" relative h-full>
      <component :is="SettingsContentMap[settingsType]" pt-10 />
    </v-container>
  </v-main>
</template>
