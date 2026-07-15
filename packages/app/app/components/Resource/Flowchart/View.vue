<script setup lang="ts">
import { NodeTypeMap } from "@/services/flowchartEditor/NodeTypeMap";
import { Background } from "@vue-flow/background";
import { VueFlow } from "@vue-flow/core";
import { MiniMap } from "@vue-flow/minimap";
import { getResultAsync } from "@esposter/shared";

interface ResourceFlowchartViewProps {
  id: string;
}

const { id } = defineProps<ResourceFlowchartViewProps>();
const { $trpc } = useNuxtApp();
const { content, name } = await getResultAsync(() => $trpc.flowchart.readPublishedResourceContent.query(id)).match(
  (publishedResource) => publishedResource,
  () => {
    throw createError({ statusCode: 404, statusMessage: "Flowchart not found" });
  },
);
const nodeTypes = Object.fromEntries(
  Object.entries(NodeTypeMap).map(([nodeType, { component }]) => [nodeType, component]),
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
