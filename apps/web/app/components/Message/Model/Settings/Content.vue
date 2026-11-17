<script setup lang="ts">
import { SETTINGS_CONTENT_ID } from "#src/services/message/settings/constants";

defineSlots<{ default: () => VNode; header: () => VNode }>();
</script>

<template>
  <div flex flex-1 flex-col min-h-0 min-w-0>
    <slot name="header" />
    <!-- The panel scrolls itself rather than the dialog, and the sidebar's scrollspy is bounded by it -->
    <div :id="SETTINGS_CONTENT_ID" p-3 ui-region-body relative>
      <!-- The scroll area owns its bottom breathing room, so no panel carries a trailing margin of its own -->
      <div pb-8 flex flex-col gap-8>
        <slot />
      </div>
    </div>
  </div>
</template>
