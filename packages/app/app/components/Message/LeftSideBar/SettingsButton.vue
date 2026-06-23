<script setup lang="ts">
import { useUserSettingsDialogStore } from "@/store/message/user/settings/dialog";

const userSettingsDialogStore = useUserSettingsDialogStore();
const { isVisible } = storeToRefs(userSettingsDialogStore);
</script>

<template>
  <v-tooltip text="User Settings">
    <template #activator="{ props: tooltipProps }">
      <v-btn :="tooltipProps" icon="mdi-cog" size="small" @click="isVisible = true" />
    </template>
  </v-tooltip>
</template>
