<script setup lang="ts">
import type { GraphNode } from "#shared/models/flowchartEditor/data/GraphNode";

import { useFlowchartEditorStore } from "@/store/flowchartEditor";
import { Handle, Position } from "@vue-flow/core";
import { NodeResizer } from "@vue-flow/node-resizer";
// @TODO: https://github.com/vuejs/core/issues/11371
interface NodeBaseProps {
  data: GraphNode["data"];
  id: GraphNode["id"];
}

const { data, id } = defineProps<NodeBaseProps>();
const { text } = useColors();
const flowchartEditorStore = useFlowchartEditorStore();
const { flowchartEditor } = storeToRefs(flowchartEditorStore);
const node = computed(() => flowchartEditor.value.nodes.find((n) => n.id === id));
</script>

<template>
  <div :class="node?.style?.backgroundColor ? undefined : 'bg-surface'" :style="node?.style" size-full>
    <NodeResizer :min-width="100" :min-height="40" :color="text" />
    <Handle type="target" :position="Position.Left" />
    <div p-2 text-center>{{ data.label }}</div>
    <Handle type="source" :position="Position.Right" />
  </div>
</template>
