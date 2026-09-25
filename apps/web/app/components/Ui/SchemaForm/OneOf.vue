<script setup lang="ts">
import type { UiSchemaFormRendererProps } from "@/models/ui/UiSchemaFormRendererProps";
import type { UiSelectItem } from "@/models/ui/UiSelectItem";
import type { JsonSchema } from "@jsonforms/core";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getSchemaFormVariantValue } from "@/services/ui/schemaForm/getSchemaFormVariantValue";
import { createCombinatorRenderInfos } from "@jsonforms/core";
import { useJsonFormsOneOfControl } from "@jsonforms/vue";

interface Props extends UiSchemaFormRendererProps {}

// JSON Forms derives whether a field is enabled or read only when the form leaves them unset, which a boolean prop
// Would read as false
const props = withDefaults(defineProps<Props>(), { enabled: undefined, readonly: undefined });
const { control, handleChange } = useJsonFormsOneOfControl(props);
const variants = computed(() => (control.value.schema.oneOf ?? []) as JsonSchema[]);
const renderInfos = computed(() =>
  createCombinatorRenderInfos(
    variants.value,
    control.value.rootSchema,
    "oneOf",
    control.value.uischema,
    control.value.path,
    control.value.uischemas,
  ),
);
// The variant the data is in is the one whose fixed discriminant it carries, or the first while it carries none
const selectedIndex = computed(() => Math.max(control.value.indexOfFittingSchema, 0));
const selectedRenderInfo = computed(() => renderInfos.value[selectedIndex.value]);
const items = computed<UiSelectItem<string>[]>(() =>
  renderInfos.value.map(({ label }, index) => ({
    meaning: UiIconMeaning.Settings,
    title: label,
    value: String(index),
  })),
);
</script>

<!-- One of a union's variants, chosen in the library's select, over the chosen variant's own fields. Switching keeps what
     The variants share and anything the schema does not describe, such as a column's id -->
<template>
  <div flex flex-col gap-4>
    <div flex flex-col gap-1>
      <span text-sm text-muted>{{ control.label || "Type" }}</span>
      <UiSelect
        :items
        :label="control.label || 'Type'"
        :model-value="String(selectedIndex)"
        @update:model-value="
          (index) => {
            const variant = variants[Number(index)];
            if (variant)
              handleChange(
                control.path,
                getSchemaFormVariantValue(control.data, variants, variant, control.rootSchema),
              );
          }
        "
      />
    </div>
    <UiSchemaFormDispatch
      v-if="selectedRenderInfo"
      :cells="control.cells"
      :enabled="control.enabled"
      :path="control.path"
      :renderers="control.renderers"
      :schema="selectedRenderInfo.schema"
      :uischema="selectedRenderInfo.uischema"
    />
  </div>
</template>
