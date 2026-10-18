<script setup lang="ts">
import type { UiSchemaFormRendererProps } from "@/models/ui/UiSchemaFormRendererProps";
import type { UISchemaElement } from "@jsonforms/core";

import { mapStateToJsonFormsRendererProps, NOT_APPLICABLE } from "@jsonforms/core";

interface Props extends UiSchemaFormRendererProps<UISchemaElement> {}
// JSON Forms derives whether a node is enabled or read only when the form leaves them unset, which a boolean prop
// Would read as false
const props = withDefaults(defineProps<Props>(), { enabled: undefined, readonly: undefined });
const rawProps = computed(() => mapStateToJsonFormsRendererProps(props.form.state, props));
// The renderer whose tester ranks this node highest draws it, and a node no renderer ranks draws nothing
const component = computed(() => {
  const { config, renderers = [], rootSchema, schema } = rawProps.value;
  let rankedComponent: Component | undefined;
  let highestRank = NOT_APPLICABLE;
  for (const { renderer: rendererComponent, tester } of renderers) {
    const rank = tester(props.uischema, schema, { config, rootSchema });
    if (rank <= highestRank) continue;
    highestRank = rank;
    rankedComponent = rendererComponent;
  }
  return rankedComponent;
});
// The props a renderer takes, which leave out the root schema: a renderer's root element would print it as an attribute
const renderer = computed(() => {
  const { rootSchema: _rootSchema, ...rest } = rawProps.value;
  return rest;
});
</script>

<!-- One node of a schema form, drawn by whichever renderer ranks it highest -->
<template>
  <component v-if="component" :is="component" :="renderer" :form />
</template>
