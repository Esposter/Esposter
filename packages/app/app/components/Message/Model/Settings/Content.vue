<script setup lang="ts">
import { SETTINGS_CONTENT_ID } from "@/services/message/settings/constants";

defineSlots<{ default: () => VNode; header: () => VNode }>();
</script>

<template>
  <v-main flex flex-col h-dvh>
    <slot name="header" />
    <div :id="SETTINGS_CONTENT_ID" bg-surface flex-1 relative overflow-y-auto>
      <v-container fluid py-0>
        <slot />
      </v-container>
    </div>
  </v-main>
</template>
