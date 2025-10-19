<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";

import { useSettingsStore } from "@/store/message/user/settings";
import { DatabaseEntityType } from "@esposter/db-schema";

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps & { tooltipProps: Record<string, unknown> }) => VNode;
}>();
const settingsStore = useSettingsStore();
const { dialog } = storeToRefs(settingsStore);
</script>

<template>
  <StyledDialog v-model="dialog" fullscreen>
    <template #activator="activatorProps">
      <v-tooltip :text="`${DatabaseEntityType.User} Settings`">
        <template #activator="{ props: tooltipProps }">
          <slot name="activator" :="{ ...activatorProps, tooltipProps }" />
        </template>
      </v-tooltip>
    </template>
    <v-app>
      <MessageModelSettingsLeftSideBar />
      <MessageModelSettingsRightSideBar @close="dialog = false" />
      <MessageModelSettingsContent />
    </v-app>
  </StyledDialog>
</template>
