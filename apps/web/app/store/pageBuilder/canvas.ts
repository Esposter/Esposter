import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";

// The canvas's selection and device in each open resource, so two webpages open at once keep their own selected node and device
export const usePageBuilderCanvasStore = defineStore("pageBuilder/canvas", () => {
  const selectedNodeIdMap = ref(new Map<string, string>());
  const deviceMap = ref(new Map<string, PageBuilderDevice>());
  // The text node being edited on the canvas in each open resource, or none when no node is being edited
  const editingNodeIdMap = ref(new Map<string, string>());
  const getDevice = (resourceId: string) => deviceMap.value.get(resourceId) ?? PageBuilderDevice.Desktop;
  const getEditingNodeId = (resourceId: string) => editingNodeIdMap.value.get(resourceId) || "";
  const getSelectedNodeId = (resourceId: string) => selectedNodeIdMap.value.get(resourceId) || "";
  const setDevice = (resourceId: string, device: PageBuilderDevice) => {
    deviceMap.value.set(resourceId, device);
  };
  const setEditingNodeId = (resourceId: string, nodeId: string) => {
    editingNodeIdMap.value.set(resourceId, nodeId);
  };
  const setSelectedNodeId = (resourceId: string, nodeId: string) => {
    selectedNodeIdMap.value.set(resourceId, nodeId);
  };
  return {
    getDevice,
    getEditingNodeId,
    getSelectedNodeId,
    selectedNodeIdMap,
    setDevice,
    setEditingNodeId,
    setSelectedNodeId,
  };
});
