<script setup lang="ts">
import type { GraphEdge } from "#shared/models/flowchartEditor/data/GraphEdge";
import type { Position } from "@vue-flow/core";
import type { CSSProperties } from "vue";

import { EdgePathMap } from "@/services/flowchartEditor/EdgePathMap";
import { BaseEdge, EdgeLabelRenderer, useVueFlow } from "@vue-flow/core";

// @TODO: https://github.com/vuejs/core/issues/11371
interface Props {
  id: GraphEdge["id"];
  label?: GraphEdge["label"];
  markerEnd?: GraphEdge["markerEnd"];
  sourcePosition: Position;
  sourceX: number;
  sourceY: number;
  style?: CSSProperties;
  targetPosition: Position;
  targetX: number;
  targetY: number;
  type: GraphEdge["type"];
}

const { id, label, markerEnd, sourcePosition, sourceX, sourceY, style, targetPosition, targetX, targetY, type } =
  defineProps<Props>();
const { setEdges } = useVueFlow();
const edgePath = computed(() =>
  EdgePathMap[type]({ sourcePosition, sourceX, sourceY, targetPosition, targetX, targetY }),
);
const labelX = computed(() => edgePath.value[1]);
const labelY = computed(() => edgePath.value[2]);
const isEditing = ref(false);
const editedLabel = ref("");
const labelInput = useTemplateRef<HTMLInputElement>("labelInput");
// Double clicking the path or its label starts an edit; the label is written back on Enter, unless it confirms an input
// Method's composition, or when focus leaves
const startEditing = async () => {
  editedLabel.value = label || "";
  isEditing.value = true;
  await nextTick();
  labelInput.value?.focus();
};
const commitLabel = () => {
  if (!isEditing.value) return;

  isEditing.value = false;
  setEdges((edges) => edges.map((edge) => (edge.id === id ? { ...edge, label: editedLabel.value } : edge)));
};
</script>

<template>
  <BaseEdge :path="edgePath[0]" :label-x :label-y :marker-end :style @dblclick="startEditing()" />
  <EdgeLabelRenderer>
    <div
      v-if="isEditing || label"
      class="nodrag nopan"
      pointer-events-all
      absolute
      :style="{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }"
      @dblclick="startEditing()"
    >
      <input
        v-if="isEditing"
        ref="labelInput"
        v-model="editedLabel"
        text-sm
        px-2
        py-1
        rd
        bg-panel
        w-32
        @blur="commitLabel()"
        @keydown.enter="!$event.isComposing && commitLabel()"
      />
      <span v-else text-sm px-2 py-1 rd bg-panel>{{ label }}</span>
    </div>
  </EdgeLabelRenderer>
</template>
