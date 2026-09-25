<script setup lang="ts">
import type { UiSchemaFormRendererProps } from "@/models/ui/UiSchemaFormRendererProps";
import type { UISchemaElement } from "@jsonforms/core";

import { NOT_APPLICABLE } from "@jsonforms/core";
import { UnknownRenderer, useJsonFormsRenderer } from "@jsonforms/vue";

interface Props extends UiSchemaFormRendererProps<UISchemaElement> {}

// JSON Forms derives whether a node is enabled or read only when the form leaves them unset, which a boolean prop
// Would read as false
const props = withDefaults(defineProps<Props>(), { enabled: undefined, readonly: undefined });
const { renderer, rootSchema } = useJsonFormsRenderer(props);
// The renderer whose tester ranks this node highest draws it, and JSON Forms' own notice when none applies
const component = computed(() => {
  const { config, renderers = [], schema, uischema } = renderer.value;
  let rankedComponent: Component = UnknownRenderer;
  let highestRank = NOT_APPLICABLE;
  for (const { renderer: rendererComponent, tester } of renderers) {
    const rank = tester(uischema, schema, { config, rootSchema: rootSchema.value });
    if (rank <= highestRank) continue;
    highestRank = rank;
    rankedComponent = rendererComponent;
  }
  return rankedComponent;
});
</script>

<!-- One node of a schema form, drawn by whichever renderer ranks it highest -->
<template>
  <component :is="component" :="renderer" />
</template>
