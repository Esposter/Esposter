<script setup lang="ts">
import { useSettingsStore } from "@/store/message/room/settings";
import { DatabaseEntityType } from "@esposter/db-schema";
import { mergeProps } from "vue";

const settingsStore = useSettingsStore();
const { dialog } = storeToRefs(settingsStore);
</script>

<template>
  <v-dialog v-model="dialog" fullscreen>
    <template #activator="{ props: activatorProps }">
      <v-tooltip :text="`${DatabaseEntityType.User} Settings`">
        <template #activator="{ props: tooltipProps }">
          <v-btn icon="mdi-cog" size="small" :="mergeProps(activatorProps, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
  </v-dialog>
</template>
