import type { FlowchartExportRequest } from "@/models/resource/FlowchartExportRequest";

export const useFlowchartExportStore = defineStore("flowchartEditor/export", () => {
  const exportRequest = shallowRef<FlowchartExportRequest>();
  const openExport = (request: FlowchartExportRequest) => {
    exportRequest.value = request;
  };
  const closeExport = () => {
    exportRequest.value = undefined;
  };
  return { closeExport, exportRequest, openExport };
});
