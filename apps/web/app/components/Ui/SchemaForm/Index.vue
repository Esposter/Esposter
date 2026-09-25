<script setup lang="ts" generic="T">
import type { UiSchemaFormConfig } from "@/models/ui/UiSchemaFormConfig";
import type { CoreActions, JsonFormsCore, JsonFormsSubStates, JsonSchema } from "@jsonforms/core";
import type { z } from "zod";

import { SchemaFormRenderers } from "@/services/ui/schemaForm/SchemaFormRenderers";
import { Actions, configReducer, coreReducer, Generate, i18nReducer } from "@jsonforms/core";
import deepEqual from "fast-deep-equal";

interface Props {
  // What only the dialog knows, whose keys a field names for the items it chooses among: a sheet's columns
  context?: object;
  // The form's JSON Schema, which JSON Forms lays out and dispatches field by field
  schema: z.core.JSONSchema.JSONSchema;
  // The form's Zod schema, which validates the whole value on every change; each issue is shown on the field at its path
  validationSchema?: z.ZodType;
}
// A form generated from a schema: JSON Forms' core lays it out and keeps every nested value in step, every component
// Drawing it is the library's own, and the Zod schema the form came from is what validates it, so JSON Forms' own
// Validation is off
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
const uischema = computed(() => Generate.uiSchema(jsonFormsSchema.value, undefined, undefined, jsonFormsSchema.value));
const options = { validationMode: "NoValidation" } as const;
// What JSON Forms' bindings read. Shallow, because its reducers return a new core for every change, so the property
// Being replaced is the only change to track, and the renderers inside are never proxied
const jsonforms = shallowReactive<JsonFormsSubStates & { core: JsonFormsCore }>({
  cells: [],
  config: configReducer(undefined, Actions.setConfig(config.value)),
  core: coreReducer(undefined, Actions.init(modelValue.value, jsonFormsSchema.value, uischema.value, options)),
  i18n: i18nReducer(undefined, Actions.updateI18n(undefined, undefined, undefined)),
  renderers: SchemaFormRenderers,
  uischemas: [],
});
// A field's change runs through the core, and the value it leaves is written back unless it is the one already held
const dispatch = (action: CoreActions) => {
  jsonforms.core = coreReducer(jsonforms.core, action);
  if (!deepEqual(jsonforms.core.data, modelValue.value)) modelValue.value = jsonforms.core.data;
};

watch([modelValue, jsonFormsSchema, uischema], ([newModelValue, newJsonFormsSchema, newUischema]) => {
  dispatch(Actions.updateCore(newModelValue, newJsonFormsSchema, newUischema, options));
});
watch(config, (newConfig) => {
  jsonforms.config = configReducer(undefined, Actions.setConfig(newConfig));
});

provide("jsonforms", jsonforms);
provide("dispatch", dispatch);
</script>

<template>
  <UiSchemaFormDispatch :schema="jsonforms.core.schema" :uischema="jsonforms.core.uischema" path="" />
</template>
