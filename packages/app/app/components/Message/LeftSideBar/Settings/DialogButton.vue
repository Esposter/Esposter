<script setup lang="ts">
import { DatabaseEntityType } from "@esposter/db-schema";
import { mergeProps } from "vue";

defineSlots<{ activator: (props: Record<string, unknown>) => VNode }>();
const dialog = ref(false);
</script>

<template>
  <v-dialog v-model="dialog" fullscreen>
    <template #activator="{ props: dialogProps }">
      <v-tooltip :text="`${DatabaseEntityType.User} Settings`">
        <template #activator="{ props: tooltipProps }">
          <slot name="activator" :="mergeProps(dialogProps, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
    <v-app>
      <MessageModelSettingsLeftSideBar />
      <MessageModelSettingsRightSideBar @close="dialog = false" />
      <MessageModelSettingsContent />
    </v-app>
  </v-dialog>
</template>
