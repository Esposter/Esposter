<script setup lang="ts">
import type { UiSchemaFormRendererProps } from "@/models/ui/UiSchemaFormRendererProps";

import { useSchemaFormControl } from "@/composables/ui/useSchemaFormControl";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";

interface Props extends UiSchemaFormRendererProps {}
// JSON Forms derives whether a field is enabled or read only when the form leaves them unset, which a boolean prop
// Would read as false
const props = withDefaults(defineProps<Props>(), { enabled: undefined, readonly: undefined });
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
