<script setup lang="ts">
import type { z } from "zod";

import { DENSE_ICON_BUTTON_PROPS } from "@/services/shared/constants";

interface Props {
  editedValue: unknown;
  icon: string;
  schema: z.ZodType;
  title: string;
  tooltipText: string;
  value: unknown;
}

defineSlots<{ default: () => VNode; "prepend-actions"?: () => VNode }>();
const { editedValue, icon, schema, title, tooltipText, value } = defineProps<Props>();
const emit = defineEmits<{ reset: []; submit: [onComplete: () => void] }>();
const isOpen = ref(false);
</script>

<template>
  <StyledTooltipIconButton
    :button-props="DENSE_ICON_BUTTON_PROPS"
    :icon
    :text="tooltipText"
    @click.stop="isOpen = true"
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
