<script setup lang="ts">
import type { VBtn } from "vuetify/components";

const RETRY_BUTTON_PROPS: VBtn["$props"] = { prependIcon: "mdi-refresh", text: "Retry" };

interface Props {
  error: string;
}

const { error } = defineProps<Props>();
const emit = defineEmits<{ retry: [] }>();
</script>

<!-- The one shape a failed read takes anywhere in the app: what went wrong, and the button that tries again.
     A surface that renders its own copy of this drifts from the rest the first time the wording changes -->
<template>
  <StyledEmptyState icon="mdi-alert-circle-outline" title="Something went wrong" :description="error">
    <StyledButton :button-props="RETRY_BUTTON_PROPS" @click="emit('retry')" />
  </StyledEmptyState>
</template>
