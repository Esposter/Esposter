<script setup lang="ts">
import type { UiStatus } from "@/models/ui/UiStatus";

import { UiStatusIconMeaningMap } from "@/services/ui/UiStatusIconMeaningMap";
import { Alert } from "@vuetify/v0";

interface Props {
  status: UiStatus;
}

// A line the page says about itself where the reader is already looking: a capped import, a failed save. An error
// Interrupts a screen reader, as the alert role does; anything else waits its turn as a status
defineSlots<{ default: () => VNode }>();
const { status } = defineProps<Props>();
</script>

<template>
  <Alert.Root #default="{ attrs }" :role="status === 'error' ? 'alert' : 'status'" renderless>
    <div
      :="attrs"
      class="alert"
      :style="{ '--ui-alert-color': `var(--ui-${status})` }"
      pr-3
      flex
      gap-2
      items-stretch
      ui-frame
    >
      <!-- A block of the status colour down its start, the one mark a glance down the page catches -->
      <span aria-hidden="true" bg="[var(--ui-alert-color)]" rd="l-[var(--ui-container-radius)]" shrink-0 w-1 />
      <span style="color: var(--ui-alert-color)" py-2 flex>
        <UiIcon :meaning="UiStatusIconMeaningMap[status]" />
      </span>
      <div py-2 flex-1 self-center>
        <slot />
      </div>
    </div>
  </Alert.Root>
</template>

<style scoped>
/* A callout: the frame tinted in its status colour, so the line reads as the page's own voice at a glance */
.alert {
  background-color: color-mix(in srgb, var(--ui-alert-color) 10%, var(--ui-panel));
}
</style>
