<script setup lang="ts">
import type { Node } from "@vue-flow/core";

import { Handle, Position } from "@vue-flow/core";
import { NodeResizer } from "@vue-flow/node-resizer";

interface ResizableNodeProps {
  data: Node["data"];
}

const { data } = defineProps<ResizableNodeProps>();
const { text } = useColors();
</script>

<template>
  <div size-full>
    <NodeResizer :min-width="100" :min-height="30" :color="text" />
    <Handle type="target" :position="Position.Left" />
    <div p-2>{{ data.label }}</div>
    <Handle type="source" :position="Position.Right" />
  </div>
</template>
