<script setup lang="ts">
import type { UiSchemaFormRendererProps } from "#src/models/ui/schemaForm/UiSchemaFormRendererProps";
import type { UiSelectItem } from "#src/models/ui/UiSelectItem";
import type { JsonSchema } from "@jsonforms/core";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { unsetRendererState } from "#src/services/ui/schemaForm/unsetRendererState";
import { prettify } from "#src/util/text/prettify";
import { toTitleCase } from "#src/util/text/toTitleCase";

interface Props extends UiSchemaFormRendererProps {}
const props = withDefaults(defineProps<Props>(), unsetRendererState);
const { change, control, issue, layout, uiSchemaFormConfiguration } = useSchemaFormControl(props);
// The values a field's schema names for its options, in the schema's own type, so a pick writes the value as the schema holds it
const schemaValues = computed<unknown[]>(() => {
  const { enum: values, oneOf } = control.value.schema;
  if (values) return values;
  return (oneOf ?? []).map((option: JsonSchema) => option.const);
});
// A select picks by its text, so a text that names a schema value is written back as that value, and any other text as itself
const getPickedValue = (text: string): unknown => schemaValues.value.find((value) => String(value) === text) ?? text;
// The items a field names from its dialog's context, or else its schema's own options: an enum's values, or the
// Titled constants of an enum written as one of several literals. An option the schema names carries no mark of its own,
// So each takes the one mark an option does
const items = computed<UiSelectItem<string>[]>(() => {
  // A context is the dialog's own interface, whose keys the schema names as strings
  if (layout.value.itemsKey)
    return (
      (Reflect.get(uiSchemaFormConfiguration.value.context, layout.value.itemsKey) as
        | UiSelectItem<string>[]
        | undefined) ?? []
    );
  const { enum: values, oneOf } = control.value.schema;
  if (values)
    return values.map((value) => ({
      meaning: UiIconMeaning.Settings,
      title: toTitleCase(prettify(String(value))),
      value: String(value),
    }));
  return (oneOf ?? []).map((option: JsonSchema) => ({
    meaning: UiIconMeaning.Settings,
    title: option.title ?? String(option.const),
    value: String(option.const),
  }));
});
</script>

<!-- A choice of a schema form: one value, or several where the field holds an array, drawn in the library's select -->
<template>
  <div flex flex-col gap-1>
    <span text-sm text-muted>{{ control.label }}</span>
    <UiSelect
      :items
      :label="control.label"
      :model-value="control.schema.type === 'array' ? (control.data ?? []) : String(control.data ?? '')"
      @update:model-value="change(Array.isArray($event) ? $event : getPickedValue($event))"
    />
    <span v-if="issue" role="alert" text-sm text-error>{{ issue }}</span>
  </div>
</template>
