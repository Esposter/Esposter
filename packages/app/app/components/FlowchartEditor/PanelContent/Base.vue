<script setup lang="ts">
import type { Node } from "@vue-flow/core";

import { useVueFlow } from "@vue-flow/core";
// @TODO: https://github.com/vuejs/core/issues/11371
interface PanelContentBaseProps {
  data: Node["data"];
  id: Node["id"];
  style: Exclude<Node["style"], Function>;
}

const { data, id, style } = defineProps<PanelContentBaseProps>();
const { updateNode } = useVueFlow();
const label = computed({
  get: () => data.label,
  set: (newLabel) => updateNode(id, { data: { label: newLabel } }),
});
const backgroundColor = computed({
  get: () => style?.backgroundColor,
  set: (newBackgroundColor) => updateNode(id, { style: { backgroundColor: newBackgroundColor } }),
});
</script>

<template>
  <v-text-field v-model="label" />
  <v-color-picker v-model="backgroundColor" />
</template>
