<script setup lang="ts">
import type { GraphNode } from "#shared/models/flowchartEditor/data/GraphNode";

import { useVueFlow } from "@vue-flow/core";
// @TODO: https://github.com/vuejs/core/issues/11371
interface PanelContentBaseProps {
  data: GraphNode["data"];
  id: GraphNode["id"];
  style?: GraphNode["style"];
}

const { data, id, style } = defineProps<PanelContentBaseProps>();
const { updateNode } = useVueFlow();
const label = computed({
  get: () => data.label,
  set: (newLabel) => updateNode(id, { data: { ...data, label: newLabel } }),
});
const backgroundColor = computed({
  get: () => style?.backgroundColor,
  set: (newBackgroundColor) => updateNode(id, { style: { ...style, backgroundColor: newBackgroundColor } }),
});
</script>

<template>
  <v-text-field v-model="label" label="Label" placeholder="Label" autofocus />
  <v-color-input
    v-model="backgroundColor"
    :width="300"
    label="Background Color"
    placeholder="Background Color"
    hide-pip
  />
</template>
