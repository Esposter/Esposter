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

defineSlots<{ actions?: () => VNode; default: () => VNode; mark?: () => VNode }>();
const { durationMs, isDismissible, status } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
// Held while the pointer is over it or focus is inside it, so a toast is never taken away mid-read or mid-click
const { start, stop } = useTimeoutFn(() => emit("close"), durationMs ?? 0, { immediate: durationMs !== undefined });
const isPointerInside = ref(false);
const isFocusInside = ref(false);
// Focus moving between two of its controls leaves and re-enters within one tick, which the watcher never sees
watch([isPointerInside, isFocusInside], ([newIsPointerInside, newIsFocusInside]) => {
  if (newIsPointerInside || newIsFocusInside) stop();
  else if (durationMs !== undefined) start();
});
</script>

<template>
  <div
    class="toast"
    :role="status === 'error' ? 'alert' : undefined"
    max-w="[min(30rem,calc(100dvw-2rem))]"
    p-3
    flex
    gap-3
    items-center
    ui-lifted
    @focusin="isFocusInside = true"
    @focusout="isFocusInside = false"
    @pointerenter="isPointerInside = true"
    @pointerleave="isPointerInside = false"
  >
    <slot name="mark">
      <span :style="{ color: `var(--ui-${status})` }"><UiIcon :meaning="UiStatusIconMeaningMap[status]" /></span>
    </slot>
    <div flex-1 min-w-0><slot /></div>
    <slot name="actions" />
    <UiIconButton
      v-if="isDismissible"
      label="Dismiss"
      :meaning="UiIconMeaning.Remove"
      :variant="UiButtonVariant.Quiet"
      @click="emit('close')"
    />
  </div>
</template>

<style scoped>
/* It steps in from the edge of the corner it lives in. Only its arrival moves: each source takes its own toast away,
   so a leaving one would need every source behind one transition group */
.toast {
  transition:
    opacity var(--ui-motion-long),
    transform var(--ui-motion-long);
}

@starting-style {
  .toast {
    opacity: 0;
    transform: translateX(calc(var(--ui-step) * 8));
  }
}
</style>
