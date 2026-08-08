<script setup lang="ts">
interface StyledErrorStateProps {
  error: string;
}

const { error } = defineProps<StyledErrorStateProps>();
const emit = defineEmits<{ retry: [] }>();
</script>

<!-- The one shape a failed read takes anywhere in the app: what went wrong, and the button that tries again.
     A surface that renders its own copy of this drifts from the rest the first time the wording changes -->
<template>
  <StyledEmptyState icon="mdi-alert-circle-outline" title="Something went wrong" :description="error">
    <v-btn prepend-icon="mdi-refresh" variant="tonal" @click="emit('retry')">Retry</v-btn>
  </StyledEmptyState>
</template>
