// @unocss-include
import type { PortableFormat } from "@/models/resource/PortableFormat";

import { FlowchartExportFormat } from "@/models/resource/FlowchartExportFormat";
import { useFlowchartEditorStore } from "@/store/flowchartEditor";
import { useFlowchartExportStore } from "@/store/flowchartEditor/export";
import { useResourceStore } from "@/store/resource";

export const createFlowchartPortableFormat = (format: FlowchartExportFormat): PortableFormat => ({
  export: async () => {
    const resourceStore = useResourceStore();
    const resourceId = resourceStore.currentResourceId;
    const flowchartEditorStore = useFlowchartEditorStore();
    const { loadContent } = flowchartEditorStore;
    await loadContent();
    if (resourceStore.currentResourceId !== resourceId || !resourceStore.resource) return;
    const { flowchartEditor } = storeToRefs(flowchartEditorStore);
    const flowchartExportStore = useFlowchartExportStore();
    const { openExport } = flowchartExportStore;
    openExport({
      edges: structuredClone(toRaw(flowchartEditor.value.edges)),
      format,
      name: resourceStore.resource.name,
      nodes: structuredClone(toRaw(flowchartEditor.value.nodes)),
    });
  },
  icon: format === FlowchartExportFormat.Png ? "i-mdi:image-outline" : "i-mdi:vector-square",
  label: format.toUpperCase(),
});
