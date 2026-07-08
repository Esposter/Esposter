<script setup lang="ts">
import { SETTINGS_CONTENT_ID } from "@/services/message/settings/constants";

defineSlots<{ default: () => VNode; header: () => VNode }>();
</script>

<template>
  <v-main flex flex-col h-dvh>
    <slot name="header" />
    <v-sheet flex-1 relative overflow-y-auto :id="SETTINGS_CONTENT_ID">
      <v-container fluid py-0>
        <slot />
      </v-container>
    </v-sheet>
  </v-main>
</template>
