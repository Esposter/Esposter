<script setup lang="ts">
import type { FlowchartExportRequest } from "@/models/resource/FlowchartExportRequest";

import { MimeType } from "#shared/models/file/MimeType";
import { FlowchartExportFormat } from "@/models/resource/FlowchartExportFormat";
import { DEFAULT_EDGE_OPTIONS } from "@/services/flowchartEditor/constants";
import { edgeTypes } from "@/services/flowchartEditor/EdgeTypeMap";
import { nodeTypes } from "@/services/flowchartEditor/NodeTypeMap";
import { captureFlowchart } from "@/services/resource/flowchart/captureFlowchart";
import { useAlertStore } from "@/store/alert";
import { useFlowchartExportStore } from "@/store/flowchartEditor/export";
import { trimFileExtension } from "@/util/file/trimFileExtension";
import { downloadFile, getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { useVueFlow, VueFlow } from "@vue-flow/core";

interface Props {
  request: FlowchartExportRequest;
}

const { request } = defineProps<Props>();
const flowchartExportStore = useFlowchartExportStore();
const alertStore = useAlertStore();
const { closeExport } = flowchartExportStore;
const { createAlert } = alertStore;
const canvas = useTemplateRef("canvas");
const { fitView } = useVueFlow("flowchart-export");
let isExporting = false;
const startExport = async () => {
  if (isExporting) return;
  isExporting = true;
  await getResultAsync(async () => {
    if (request.nodes.length > 0) await fitView({ padding: 0.12 });
    await window.document.fonts.ready;
    await nextTick();
    const element = canvas.value?.querySelector<HTMLElement>(".vue-flow");
    if (!element) throw new InvalidOperationError(Operation.Create, startExport.name, "Export canvas is unavailable");
    const blob = await captureFlowchart(element, request.format);
    const mimeType = request.format === FlowchartExportFormat.Png ? MimeType.Png : MimeType.Svg;
    downloadFile(`${trimFileExtension(request.name)}.${request.format}`, blob, mimeType);
  }).match(
    () => closeExport(),
    (error) => {
      createAlert("Couldn't export this flowchart", "error");
      console.error(error);
      closeExport();
    },
  );
};
onMounted(async () => {
  if (request.nodes.length === 0) await startExport();
});
</script>

<template>
  <div ref="canvas" class="flowchart-export-canvas" aria-hidden="true">
    <VueFlow
      id="flowchart-export"
      :default-edge-options="DEFAULT_EDGE_OPTIONS"
      :edges="request.edges"
      :edge-types
      :nodes="request.nodes"
      :node-types
      :nodes-connectable="false"
      :nodes-draggable="false"
      :elements-selectable="false"
      text-text
      bg-background
      @nodes-initialized="startExport()"
    />
  </div>
</template>

<style scoped>
.flowchart-export-canvas {
  position: fixed;
  top: 0;
  left: -100vw;
  width: 100vw;
  height: 100dvh;
}

:deep(.vue-flow__handle),
:deep(.vue-flow__resize-control) {
  display: none;
}
</style>
