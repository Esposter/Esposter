<script setup lang="ts">
import type { Promisable } from "type-fest";
import type { z } from "zod";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  editedValue: unknown;
  schema: z.ZodType;
  submit: () => Promisable<unknown>;
  title: string;
  tooltipText: string;
  value: unknown;
}

defineSlots<{ default: () => VNode; "prepend-actions"?: () => VNode }>();
const { editedValue, schema, submit, title, tooltipText, value } = defineProps<Props>();
const emit = defineEmits<{ reset: [] }>();
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
    :submit
    :title
    :value
    is-create
    @reset="emit('reset')"
  >
    <template v-if="$slots['prepend-actions']" #prepend-actions>
      <slot name="prepend-actions" />
    </template>
    <slot />
  </ResourceSheetEditDialog>
</template>
