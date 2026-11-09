<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  // The row's place in its list, and the list's length, which decide which of the moves the row can take
  count: number;
  index: number;
  // The noun the buttons' labels name the row by
  noun?: string;
}

const { noun = "row" } = defineProps<Props>();
const emit = defineEmits<{ move: [toIndex: number]; remove: [] }>();
</script>

<template>
  <UiIconButton
    :disabled="index === 0"
    :label="`Move ${noun} ${index + 1} up`"
    :meaning="UiIconMeaning.ArrowUp"
    :variant="UiButtonVariant.Quiet"
    @click="emit('move', index - 1)"
  />
  <UiIconButton
    :disabled="index === count - 1"
    :label="`Move ${noun} ${index + 1} down`"
    :meaning="UiIconMeaning.ArrowDown"
    :variant="UiButtonVariant.Quiet"
    @click="emit('move', index + 1)"
  />
  <UiIconButton
    :label="`Remove ${noun} ${index + 1}`"
    :meaning="UiIconMeaning.Remove"
    :variant="UiButtonVariant.Quiet"
    @click="emit('remove')"
  />
</template>
