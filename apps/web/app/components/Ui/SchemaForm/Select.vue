<script setup lang="ts">
import type { UiSelectItem } from "@/models/ui/UiSelectItem";
import type { ControlElement, JsonSchema } from "@jsonforms/core";

import { useSchemaFormControl } from "@/composables/ui/useSchemaFormControl";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { prettify } from "@/util/text/prettify";
import { toTitleCase } from "@/util/text/toTitleCase";
import { rendererProps } from "@jsonforms/vue";

// JSON Forms hands every renderer the same runtime props its binding reads, so they are declared by its own factory
const props = defineProps(rendererProps<ControlElement>());
const { change, config, control, issue, layout } = useSchemaFormControl(props);
// An array of values is a choice of several from the same items
const isMultiple = computed(() => control.value.schema.type === "array");
// The items a field names from its dialog's context, or else its schema's own options: an enum's values, or the
// Titled constants of an enum written as one of several literals. An option the schema names carries no mark of its own,
// So each takes the one mark an option does
const items = computed<UiSelectItem<string>[]>(() => {
  // A context is the dialog's own interface, whose keys the schema names as strings
  if (layout.value.itemsKey)
    return (Reflect.get(config.value.context, layout.value.itemsKey) as UiSelectItem<string>[] | undefined) ?? [];
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
      :model-value="isMultiple ? (control.data ?? []) : (control.data ?? '')"
      @update:model-value="change($event)"
    />
    <span v-if="issue" role="alert" text-sm text-error>{{ issue }}</span>
  </div>
</template>
