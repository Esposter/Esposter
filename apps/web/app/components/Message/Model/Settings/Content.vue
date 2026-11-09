<script setup lang="ts">
import { SETTINGS_CONTENT_ID } from "@/services/message/settings/constants";

interface Props {
  // A panel that is one full-bleed child drops the body's padding and keeps its scroll
  isBodyBare?: true;
}

defineSlots<{ default: () => VNode; header: () => VNode }>();
const { isBodyBare } = defineProps<Props>();
</script>

<template>
  <div flex flex-1 flex-col min-w-0>
    <slot name="header" />
    <!-- The panel scrolls itself rather than the dialog, and the sidebar's scrollspy is bounded by it -->
    <div :id="SETTINGS_CONTENT_ID" ui-region-body relative :class="isBodyBare ? undefined : 'p-3'">
      <slot />
    </div>
  </div>
</template>
