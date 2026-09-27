<script setup lang="ts">
import type { GraphNode } from "#shared/models/flowchartEditor/data/GraphNode";

import { Handle, Position, useNode } from "@vue-flow/core";
import { NodeResizer } from "@vue-flow/node-resizer";

// @TODO: https://github.com/vuejs/core/issues/11371
interface Props {
  data: GraphNode["data"];
}

const { data } = defineProps<Props>();
// The node as the canvas drawing it holds it, so a published page, which loads no editor store, still draws the
// Colour and size the editor wrote
const { node } = useNode();
const style = computed(() => (typeof node.style === "function" ? node.style(node) : node.style) || {});
</script>

<template>
  <div class="node" :style size-full>
    <NodeResizer :min-width="120" :min-height="60" color="var(--ui-text)" />
    <Handle type="target" :position="Position.Left" />
    <div p-2 text-center>{{ data.label }}</div>
    <Handle type="source" :position="Position.Right" />
  </div>
</template>

<style scoped>
/* Unconditional: a node carrying its own backgroundColor sets it inline, which outranks this */
.node {
  background-color: var(--ui-panel);
}
</style>
