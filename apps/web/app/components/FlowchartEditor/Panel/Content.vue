<script setup lang="ts">
import type { GraphNode } from "#shared/models/flowchartEditor/data/GraphNode";

import { DEFAULT_NODE_BACKGROUND_COLOR } from "@/services/flowchartEditor/constants";
import { useVueFlow } from "@vue-flow/core";
// @TODO: https://github.com/vuejs/core/issues/11371
interface Props {
  data: GraphNode["data"];
  id: GraphNode["id"];
  style?: GraphNode["style"];
}

const { data, id, style } = defineProps<Props>();
const { updateNode } = useVueFlow();
const label = computed({
  get: () => String(data.label ?? ""),
  set: (newLabel) => updateNode(id, { data: { ...data, label: newLabel } }),
});
const backgroundColor = computed({
  get: () => String(style?.backgroundColor ?? DEFAULT_NODE_BACKGROUND_COLOR),
  set: (newBackgroundColor) => updateNode(id, { style: { ...style, backgroundColor: newBackgroundColor } }),
});
</script>

<template>
  <UiTextField v-model="label" label="Label" placeholder="Label" />
  <UiColorField v-model="backgroundColor" label="Background colour" />
</template>
