<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";

interface Props {
  isPending: boolean;
}

defineProps<Props>();
const emit = defineEmits<{ cancel: []; confirm: [] }>();
</script>

<template>
  <UiButton :variant="UiButtonVariant.Quiet" @click="emit('cancel')">Cancel</UiButton>
  <UiButton :is-pending :variant="UiButtonVariant.Accent" @click="emit('confirm')">Import</UiButton>
</template>
