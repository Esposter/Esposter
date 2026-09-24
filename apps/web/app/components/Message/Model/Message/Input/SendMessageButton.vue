<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  disabled?: boolean;
}

const { disabled } = defineProps<Props>();
const emit = defineEmits<{ click: [] }>();
</script>

<!-- Sending is the one thing the composer leads with, so it is its accent; with nothing to send it stands disabled -->
<template>
  <UiIconButton
    :disabled
    label="Send (Enter)"
    :meaning="UiIconMeaning.Send"
    :variant="UiButtonVariant.Accent"
    @click="emit('click')"
  />
</template>
