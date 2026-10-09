<script setup lang="ts">
import type { GraphEdge } from "#shared/models/flowchartEditor/data/GraphEdge";

import { EDGE_PATH_TYPE_ITEMS } from "@/services/flowchartEditor/constants";
import { useVueFlow } from "@vue-flow/core";

// @TODO: https://github.com/vuejs/core/issues/11371
interface Props {
  id: GraphEdge["id"];
  label?: GraphEdge["label"];
  type: GraphEdge["type"];
}

const { id, label, type } = defineProps<Props>();
const { setEdges } = useVueFlow();
const updateEdge = (patch: Partial<Pick<GraphEdge, "label" | "type">>) =>
  setEdges((edges) => edges.map((edge) => (edge.id === id ? { ...edge, ...patch } : edge)));
const edgeLabel = computed({ get: () => label || "", set: (newLabel) => updateEdge({ label: newLabel }) });
const pathType = computed({ get: () => type, set: (newType) => updateEdge({ type: newType }) });
</script>

<template>
  <UiTextField v-model="edgeLabel" label="Label" placeholder="Label" />
  <UiToggleGroup v-model="pathType" :items="EDGE_PATH_TYPE_ITEMS" label="Path" />
</template>
