<script setup lang="ts">
import type { UiSchemaFormRendererProps } from "@/models/ui/schemaForm/UiSchemaFormRendererProps";

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
  <!-- A schema's length limit is counted under the field, so the reader sees what the schema allows before a save is refused -->
  <UiTextField
    :counter="control.schema.maxLength"
    :error="issue"
    :is-disabled="!control.enabled || undefined"
    :label="control.label"
    :model-value="control.data === undefined || control.data === null ? '' : String(control.data)"
    :rows="layout.isMultiline ? 3 : undefined"
    :type="isNumber ? UiTextFieldType.Number : undefined"
    @update:model-value="(value) => change(isNumber ? (value === '' ? undefined : Number(value)) : value)"
  />
</template>
