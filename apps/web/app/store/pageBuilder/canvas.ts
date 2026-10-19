import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";

// The canvas's selection and device in each open resource, so two webpages open at once keep their own selected node and device
export const usePageBuilderCanvasStore = defineStore("pageBuilder/canvas", () => {
  const selectedNodeIdMap = ref(new Map<string, string>());
  const deviceMap = ref(new Map<string, PageBuilderDevice>());
  const getDevice = (resourceId: string) => deviceMap.value.get(resourceId) ?? PageBuilderDevice.Desktop;
  const getSelectedNodeId = (resourceId: string) => selectedNodeIdMap.value.get(resourceId) || "";
  const setDevice = (resourceId: string, device: PageBuilderDevice) => {
    deviceMap.value.set(resourceId, device);
  };
  const setSelectedNodeId = (resourceId: string, nodeId: string) => {
    selectedNodeIdMap.value.set(resourceId, nodeId);
  };
  return { getDevice, getSelectedNodeId, selectedNodeIdMap, setDevice, setSelectedNodeId };
});
