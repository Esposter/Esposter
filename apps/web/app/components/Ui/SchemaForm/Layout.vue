<script setup lang="ts">
import type { UiSchemaFormRendererProps } from "@/models/ui/UiSchemaFormRendererProps";
import type { Layout } from "@jsonforms/core";

import { useJsonFormsLayout } from "@jsonforms/vue";

interface Props extends UiSchemaFormRendererProps<Layout> {}
// JSON Forms derives whether a node is enabled or read only when the form leaves them unset, which a boolean prop
// Would read as false
const props = withDefaults(defineProps<Props>(), { enabled: undefined, readonly: undefined });
const { layout } = useJsonFormsLayout(props);
const isGroup = computed(() => layout.value.uischema.type === "Group");
const labelId = useId();
</script>

<!-- A layout's elements stacked, framed under their label where the layout is a group, as a nested object is. The
  Form passes no UI schema, so the generated vertical layouts and groups are all it draws -->
<template>
  <div
    v-if="layout.visible"
    :role="isGroup ? 'group' : undefined"
    :aria-labelledby="isGroup && layout.label ? labelId : undefined"
    flex
    flex-col
    gap-4
    :class="{ 'p-3 ui-frame': isGroup }"
  >
    <span v-if="isGroup && layout.label" :id="labelId" text-heading-color>{{ layout.label }}</span>
    <UiSchemaFormDispatch
      v-for="(element, index) of layout.uischema.elements"
      :key="index"
      :cells="layout.cells"
      :enabled="layout.enabled"
      :path="layout.path"
      :renderers="layout.renderers"
      :schema="layout.schema"
      :uischema="element"
    />
  </div>
</template>
