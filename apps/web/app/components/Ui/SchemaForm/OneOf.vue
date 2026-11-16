<script setup lang="ts">
import type { UiSchemaFormRendererProps } from "#src/models/ui/schemaForm/UiSchemaFormRendererProps";
import type { UiSelectItem } from "#src/models/ui/UiSelectItem";
import type { JsonSchema } from "@jsonforms/core";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getSchemaFormVariantIndex } from "#src/services/ui/schemaForm/getSchemaFormVariantIndex";
import { getSchemaFormVariantValue } from "#src/services/ui/schemaForm/getSchemaFormVariantValue";
import { unsetRendererState } from "#src/services/ui/schemaForm/unsetRendererState";
import { omitUndefined } from "@esposter/shared";
import { createCombinatorRenderInfos, mapDispatchToControlProps, mapStateToOneOfProps } from "@jsonforms/core";

interface Props extends UiSchemaFormRendererProps {}
const props = withDefaults(defineProps<Props>(), unsetRendererState);
const control = computed(() => ({ ...props, ...mapStateToOneOfProps(props.form.state, omitUndefined(props)) }));
const { handleChange } = mapDispatchToControlProps(props.form.dispatch);
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
const selectedIndex = computed(() =>
  getSchemaFormVariantIndex(control.value.data, variants.value, control.value.indexOfFittingSchema),
);
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
                getSchemaFormVariantValue(
                  control.data,
                  variants,
                  variant,
                  control.rootSchema,
                  control.indexOfFittingSchema,
                ),
              );
          }
        "
      />
    </div>
    <UiSchemaFormDispatch
      v-if="selectedRenderInfo"
      :cells="control.cells"
      :enabled="control.enabled"
      :form
      :path="control.path"
      :renderers="control.renderers"
      :schema="selectedRenderInfo.schema"
      :uischema="selectedRenderInfo.uischema"
    />
  </div>
</template>
