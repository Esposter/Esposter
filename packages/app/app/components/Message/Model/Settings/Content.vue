<script setup lang="ts">
import { SETTINGS_CONTENT_ID } from "@/services/message/settings/constants";

defineSlots<{ default: () => VNode }>();
</script>

<template>
  <v-main h-dvh>
    <div :id="SETTINGS_CONTENT_ID" bg-surface h-full relative overflow-y-auto>
      <v-container fluid py-0>
        <slot />
      </v-container>
    </div>
  </v-main>
</template>
