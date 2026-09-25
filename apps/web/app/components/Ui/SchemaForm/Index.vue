<script setup lang="ts" generic="T">
import type { UiSchemaFormConfig } from "@/models/ui/UiSchemaFormConfig";
import type { JsonSchema } from "@jsonforms/core";
import type { z } from "zod";

import { SchemaFormRenderers } from "@/services/ui/schemaForm/SchemaFormRenderers";
import { SchemaFormStyles } from "@/services/ui/schemaForm/SchemaFormStyles";
import { JsonForms } from "@jsonforms/vue";
import deepEqual from "fast-deep-equal";

interface Props {
  // What only the dialog knows, whose keys a field names for the items it chooses among: a sheet's columns
  context?: object;
  // The form's JSON Schema, which JSON Forms lays out and dispatches field by field
  schema: z.core.JSONSchema.JSONSchema;
  // The form's Zod schema, which validates the whole value on every change; each issue is shown on the field at its path
  validationSchema?: z.ZodType;
}

// A form generated from a schema: JSON Forms lays it out and keeps every nested value in step, the fields are the
// Library's own, and the Zod schema the form came from is what validates it, so JSON Forms' own validation is off
const modelValue = defineModel<T>({ required: true });
const { context = {}, schema, validationSchema } = defineProps<Props>();
const config = computed<UiSchemaFormConfig>(() => {
  const issueMap = new Map<string, string>();
  const result = validationSchema?.safeParse(modelValue.value);
  if (result && !result.success)
    for (const { message, path } of result.error.issues) {
      const key = path.join(".");
      if (!issueMap.has(key)) issueMap.set(key, message);
    }
  return { context, issueMap };
});

// Zod types what it generates as draft 2020-12 JSON Schema, and JSON Forms types what it reads as draft 7; the keywords
// A form schema holds — types, properties, required, enum, const, oneOf, items, titles — mean the same in both
const jsonFormsSchema = computed(() => schema as JsonSchema);

provide("styles", SchemaFormStyles);
</script>

<template>
  <JsonForms
    :config
    :data="modelValue"
    :renderers="SchemaFormRenderers"
    :schema="jsonFormsSchema"
    validation-mode="NoValidation"
    @change="
      ({ data }) => {
        if (!deepEqual(data, modelValue)) modelValue = data;
      }
    "
  />
</template>
