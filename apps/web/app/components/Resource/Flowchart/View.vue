<script setup lang="ts">
import { nodeTypes } from "@/services/flowchartEditor/NodeTypeMap";
import { ResourceType } from "@esposter/db-schema";
import { Background } from "@vue-flow/background";
import { VueFlow } from "@vue-flow/core";
import { MiniMap } from "@vue-flow/minimap";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/minimap/dist/style.css";

interface Props {
  id: string;
}

const { id } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const { content } = await useReadPublishedResourceContent(ResourceType.Flowchart, id, () =>
  $trpc.flowchart.readPublishedResourceContent.query(id),
);
</script>

<template>
  <!-- VueFlow reads the DOM at mount, so the published render is client-only like the editor blade -->
  <ClientOnly>
    <!-- Editing is off across the board, but pan/zoom stays — a large diagram is unreadable without it -->
    <VueFlow
      h="[calc(100dvh_-_--app-bar-height)]"
      :node-types
      :nodes="content.nodes"
      :edges="content.edges"
      :nodes-draggable="false"
      :nodes-connectable="false"
      :elements-selectable="false"
    >
      <Background />
      <MiniMap bg-surface />
    </VueFlow>
  </ClientOnly>
</template>
