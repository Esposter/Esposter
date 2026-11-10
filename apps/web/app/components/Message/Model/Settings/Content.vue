<script setup lang="ts">
import { SETTINGS_CONTENT_ID } from "@/services/message/settings/constants";

defineSlots<{ default: () => VNode; header: () => VNode }>();
</script>

<template>
  <div flex flex-1 flex-col min-h-0 min-w-0>
    <slot name="header" />
    <!-- The panel scrolls itself rather than the dialog, and the sidebar's scrollspy is bounded by it -->
    <div :id="SETTINGS_CONTENT_ID" p-3 ui-region-body relative>
      <slot />
    </div>
  </div>
</template>
