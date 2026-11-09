<script setup lang="ts">
import { SETTINGS_CONTENT_ID } from "@/services/message/settings/constants";

defineSlots<{ default: () => VNode; header: () => VNode }>();
</script>

<template>
  <div flex flex-1 flex-col min-w-0>
    <slot name="header" />
    <!-- The panel scrolls itself rather than the dialog, and the sidebar's scrollspy is bounded by it -->
    <div :id="SETTINGS_CONTENT_ID" ui-region-body relative p-3>
      <slot />
    </div>
  </div>
</template>
