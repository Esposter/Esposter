<script setup lang="ts">
import { useSettingsStore } from "@/store/message/settings";
import { mergeProps } from "vue";

const settingsStore = useSettingsStore();
const { dialog } = storeToRefs(settingsStore);
</script>

<template>
  <v-dialog v-model="dialog" fullscreen>
    <template #activator="{ props: dialogProps }">
      <v-tooltip text="User Settings">
        <template #activator="{ props: tooltipProps }">
          <v-btn icon="mdi-cog" size="small" :="mergeProps(dialogProps, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
    <v-app>
      <MessageLeftSideBarSettingsLeftSideBar />
      <MessageLeftSideBarSettingsRightSideBar />
      <MessageLeftSideBarSettingsContent />
    </v-app>
  </v-dialog>
</template>
