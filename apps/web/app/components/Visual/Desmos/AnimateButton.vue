<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

const emit = defineEmits<{ click: [event: MouseEvent] }>();
</script>

<!-- The one thing the drawing asks of the reader, so it leads in the accent, in the corner past the dock -->
<template>
  <UiButton
    :variant="UiButtonVariant.Accent"
    bottom="[calc(var(--dock-inset-block-end)+1rem)]"
    left="[calc(var(--dock-inset-inline-start)+1rem)]"
    fixed
    @click="emit('click', $event)"
  >
    <UiIcon :meaning="UiIconMeaning.Play" />
    Animate
  </UiButton>
</template>
