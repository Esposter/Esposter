<script setup lang="ts">
import type { UiStatus } from "@/models/ui/UiStatus";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiStatusIconMeaningMap } from "@/services/ui/UiStatusIconMeaningMap";

interface Props {
  // How long it stays before it closes itself; without one it stays until its source takes it away
  durationMs?: number;
  // Whether the reader can put it away before then
  isDismissible?: true;
  status: UiStatus;
}

const slots = defineSlots<{ actions?: () => VNode; default: () => VNode; mark?: () => VNode }>();
const { durationMs, isDismissible, status } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
// Held while the pointer is over it or focus is inside it, so a toast is never taken away mid-read or mid-click
const { start, stop } = useTimeoutFn(() => emit("close"), durationMs ?? 0, { immediate: durationMs !== undefined });
const resume = () => {
  if (durationMs !== undefined) start();
};
</script>

<template>
  <div
    :role="status === 'error' ? 'alert' : undefined"
    max-w="[min(30rem,calc(100dvw-2rem))]"
    p-3
    flex
    gap-3
    items-center
    ui-frame
    @focusin="stop()"
    @focusout="resume()"
    @pointerenter="stop()"
    @pointerleave="resume()"
  >
    <slot name="mark">
      <span :style="{ color: `var(--ui-${status})` }"><UiIcon :meaning="UiStatusIconMeaningMap[status]" /></span>
    </slot>
    <div flex-1 min-w-0><slot /></div>
    <slot v-if="slots.actions" name="actions" />
    <UiIconButton
      v-if="isDismissible"
      label="Dismiss"
      :meaning="UiIconMeaning.Remove"
      :variant="UiButtonVariant.Quiet"
      @click="emit('close')"
    />
  </div>
</template>
