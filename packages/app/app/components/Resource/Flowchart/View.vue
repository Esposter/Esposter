<script setup lang="ts">
import { nodeTypes } from "@/services/flowchartEditor/NodeTypeMap";
import { Background } from "@vue-flow/background";
import { VueFlow } from "@vue-flow/core";
import { MiniMap } from "@vue-flow/minimap";
import { ResourceType } from "@esposter/db-schema";

interface ResourceFlowchartViewProps {
  id: string;
}

const { id } = defineProps<ResourceFlowchartViewProps>();
const { $trpc } = useNuxtApp();
const { content, name } = await useReadPublishedResourceContent(ResourceType.Flowchart, id, () =>
  $trpc.flowchart.readPublishedResourceContent.query(id),
);
useSeoMeta({ ogTitle: name, ogUrl: useRequestURL().href, title: name });
</script>

<template>
  <!-- VueFlow reads the DOM at mount, so the published render is client-only like the editor blade -->
  <ClientOnly>
    <!-- Editing is off across the board, but pan/zoom stays — a large diagram is unreadable without it -->
    <VueFlow
      h="[calc(100dvh-var(--app-bar-height))]"
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

<style lang="scss">
@use "@vue-flow/core/dist/style.css" as *;
@use "@vue-flow/core/dist/theme-default.css";
@use "@vue-flow/minimap/dist/style.css" as *;
</style>
