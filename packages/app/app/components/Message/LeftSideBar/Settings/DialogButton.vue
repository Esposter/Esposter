<script setup lang="ts">
import { SettingsContentMap } from "@/services/message/settings/SettingsContentMap";
import { useSettingsStore } from "@/store/message/settings";
import { mergeProps } from "vue";

const settingsStore = useSettingsStore();
const { settingsType } = storeToRefs(settingsStore);
const dialog = ref(false);
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
    <StyledCard>
      <v-btn absolute top-4 right-4 icon="mdi-close" size="small" @click="dialog = false" />
      <MessageLeftSideBarSettingsLeftSideBar />
      <component :is="SettingsContentMap[settingsType]" />
    </StyledCard>
  </v-dialog>
</template>
