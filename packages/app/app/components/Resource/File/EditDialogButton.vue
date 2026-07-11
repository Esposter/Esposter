<script setup lang="ts">
import type { z } from "zod";

interface EditDialogButtonProps {
  editedValue: unknown;
  icon?: string;
  isCreate?: true;
  schema: z.ZodType;
  title: string;
  tooltipText: string;
  value: unknown;
}

defineSlots<{ default: () => VNode; "prepend-actions"?: () => VNode }>();
const {
  editedValue,
  icon = "mdi-pencil",
  isCreate,
  schema,
  title,
  tooltipText,
  value,
} = defineProps<EditDialogButtonProps>();
const emit = defineEmits<{ reset: []; submit: [onComplete: () => void] }>();
const isOpen = ref(false);
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ class: 'm-0', size: 'small', tile: true }"
    :icon
    :text="tooltipText"
    @click.stop="isOpen = true"
  />
  <ResourceFileEditDialog
    v-model="isOpen"
    :edited-value
    :is-create
    :schema
    :title
    :value
    @reset="emit('reset')"
    @submit="(onComplete) => emit('submit', onComplete)"
  >
    <template #prepend-actions>
      <slot name="prepend-actions" />
    </template>
    <slot />
  </ResourceFileEditDialog>
</template>
