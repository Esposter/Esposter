<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import type { z } from "zod";

interface Props {
  editedValue: unknown;
  schema: z.ZodType;
  title: string;
  tooltipText: string;
  value: unknown;
}

defineSlots<{ default: () => VNode; "prepend-actions"?: () => VNode }>();
const { editedValue, schema, title, tooltipText, value } = defineProps<Props>();
const emit = defineEmits<{ reset: []; submit: [onComplete: () => void] }>();
const isOpen = ref(false);
</script>

<template>
  <UiIconButton
    :label="tooltipText"
    :meaning="UiIconMeaning.Create"
    :variant="UiButtonVariant.Quiet"
    @click="isOpen = true"
  />
  <ResourceSheetEditDialog
    v-model="isOpen"
    :edited-value
    :schema
    :title
    :value
    is-create
    @reset="emit('reset')"
    @submit="(onComplete) => emit('submit', onComplete)"
  >
    <template v-if="$slots['prepend-actions']" #prepend-actions>
      <slot name="prepend-actions" />
    </template>
    <slot />
  </ResourceSheetEditDialog>
</template>
