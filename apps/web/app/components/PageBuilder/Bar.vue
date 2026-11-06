<script setup lang="ts">
import type { EditorFinding } from "@/models/editor/EditorFinding";

import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";

interface Props {
  // The findings the editor's check holds for its document, which the problems surface lists
  findings: EditorFinding[];
  // The title of the node a finding names, which the problems surface shows against it
  getNodeTitle: (nodeId: string) => string;
  resourceId: string;
}

const { findings, getNodeTitle, resourceId } = defineProps<Props>();
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const { setSelectedNodeId } = pageBuilderCanvasStore;
</script>

<template>
  <div px-3 py-2 flex flex-wrap gap-4 ui-bar items-center>
    <PageBuilderCanvasDeviceToggle :resource-id />
    <EditorProblems
      :findings
      :get-node-title="getNodeTitle"
      @select="(nodeId) => setSelectedNodeId(resourceId, nodeId)"
    />
  </div>
</template>
