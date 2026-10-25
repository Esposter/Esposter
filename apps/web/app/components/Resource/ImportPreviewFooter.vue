<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";

interface Props {
  isPending: boolean;
}

defineProps<Props>();
const emit = defineEmits<{ cancel: []; confirm: [] }>();
</script>

<template>
  <footer p-3 flex gap-2 justify-end>
    <UiButton :variant="UiButtonVariant.Quiet" @click="emit('cancel')">Cancel</UiButton>
    <UiButton :is-pending :variant="UiButtonVariant.Accent" @click="emit('confirm')">Import</UiButton>
  </footer>
</template>
