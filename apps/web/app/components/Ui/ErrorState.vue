<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  error: string;
}

const { error } = defineProps<Props>();
const emit = defineEmits<{ retry: [] }>();
</script>

<!-- The one shape a failed read takes: what went wrong, announced as it lands, and the button that tries again -->
<template>
  <UiEmptyState :description="error" :meaning="UiIconMeaning.Failure" role="alert" title="Something went wrong">
    <UiButton @click="emit('retry')">Try again</UiButton>
  </UiEmptyState>
</template>
