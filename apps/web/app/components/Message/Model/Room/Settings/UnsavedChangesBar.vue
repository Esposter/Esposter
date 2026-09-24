<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";

const emit = defineEmits<{ reset: []; save: [] }>();
</script>

<!-- Pinned to the bottom rather than trailing the form, which is Discord's own shape here: the control that made the
     change is scrolled away by the time the reader looks for a save, and a save they cannot see reads as a change that
     already took. Lifted, so the form scrolls under the bar rather than through it, and rising into place as the first
     change is made -->
<template>
  <div class="bar" role="status" px-3 py-2 flex gap-2 items-center bottom-4 sticky ui-lifted>
    <span flex-1 min-w-0 truncate>You have unsaved changes.</span>
    <UiButton :variant="UiButtonVariant.Quiet" @click="emit('reset')">Reset</UiButton>
    <UiButton :variant="UiButtonVariant.Accent" @click="emit('save')">Save changes</UiButton>
  </div>
</template>

<style scoped>
.bar {
  transition:
    opacity var(--ui-motion-medium),
    translate var(--ui-motion-medium);
}

@starting-style {
  .bar {
    opacity: 0;
    translate: 0 calc(var(--ui-step) * 4);
  }
}
</style>
