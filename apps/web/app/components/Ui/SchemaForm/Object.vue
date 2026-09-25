<script setup lang="ts">
import type { UiSchemaFormRendererProps } from "@/models/ui/UiSchemaFormRendererProps";

import { findUISchema, Generate } from "@jsonforms/core";
import { useJsonFormsControlWithDetail } from "@jsonforms/vue";

interface Props extends UiSchemaFormRendererProps {}
// JSON Forms derives whether a field is enabled or read only when the form leaves them unset, which a boolean prop
// Would read as false
const props = withDefaults(defineProps<Props>(), { enabled: undefined, readonly: undefined });
const { control } = useJsonFormsControlWithDetail(props);
// An object's fields laid out as a group under its label, or stacked bare where the object is the form itself
const detailUiSchema = computed(() =>
  findUISchema(
    control.value.uischemas,
    control.value.schema,
    control.value.uischema.scope,
    control.value.path,
    () => {
      const uischema = Generate.uiSchema(control.value.schema, "Group", undefined, control.value.rootSchema);
      if (!control.value.path) return { ...uischema, type: "VerticalLayout" };
      return { ...uischema, label: control.value.label };
    },
    control.value.uischema,
    control.value.rootSchema,
  ),
);
</script>

<!-- An object of a schema form, drawn as its own fields -->
<template>
  <UiSchemaFormDispatch
    v-if="control.visible"
    :cells="control.cells"
    :enabled="control.enabled"
    :path="control.path"
    :renderers="control.renderers"
    :schema="control.schema"
    :uischema="detailUiSchema"
  />
</template>
