// The canvas's selection in each open resource, so two webpages open at once keep their own selected node
export const usePageBuilderCanvasStore = defineStore("pageBuilder/canvas", () => {
  const selectedNodeIdMap = ref(new Map<string, string>());
  const getSelectedNodeId = (resourceId: string) => selectedNodeIdMap.value.get(resourceId) || "";
  const setSelectedNodeId = (resourceId: string, nodeId: string) => {
    selectedNodeIdMap.value.set(resourceId, nodeId);
  };
  return { getSelectedNodeId, selectedNodeIdMap, setSelectedNodeId };
});
