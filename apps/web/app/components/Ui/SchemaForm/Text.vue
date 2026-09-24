<script setup lang="ts">
import type { ControlElement } from "@jsonforms/core";

import { useSchemaFormControl } from "@/composables/ui/useSchemaFormControl";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { rendererProps } from "@jsonforms/vue";

// JSON Forms hands every renderer the same runtime props its binding reads, so they are declared by its own factory
const props = defineProps(rendererProps<ControlElement>());
const { change, control, issue, layout } = useSchemaFormControl(props);
const isNumber = computed(() => control.value.schema.type === "number" || control.value.schema.type === "integer");
</script>

<!-- A string or a number of a schema form, one line or several as its layout says; a read-only one is disabled -->
<template>
  <UiTextField
    :error="issue"
    :is-disabled="!control.enabled || undefined"
    :label="control.label"
    :model-value="control.data === undefined || control.data === null ? '' : String(control.data)"
    :rows="layout.isMultiline ? 3 : undefined"
    :type="isNumber ? UiTextFieldType.Number : undefined"
    @update:model-value="(value) => change(isNumber ? (value === '' ? undefined : Number(value)) : value)"
  />
</template>
