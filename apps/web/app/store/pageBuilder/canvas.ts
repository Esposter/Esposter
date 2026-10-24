import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
import { StyleState } from "#shared/models/pageBuilder/StyleState";

// The canvas's selection, device and style state in each open resource, so two webpages open at once keep their own selected node, device and style state
export const usePageBuilderCanvasStore = defineStore("pageBuilder/canvas", () => {
  const selectedNodeIdMap = ref(new Map<string, string>());
  const deviceMap = ref(new Map<string, PageBuilderDevice>());
  // The text node being edited on the canvas in each open resource, or none when no node is being edited
  const editingNodeIdMap = ref(new Map<string, string>());
  // The state the style panel edits in each open resource: its default, or its hover
  const styleStateMap = ref(new Map<string, StyleState>());
  const getDevice = (resourceId: string) => deviceMap.value.get(resourceId) ?? PageBuilderDevice.Desktop;
  const getEditingNodeId = (resourceId: string) => editingNodeIdMap.value.get(resourceId) || "";
  const getSelectedNodeId = (resourceId: string) => selectedNodeIdMap.value.get(resourceId) || "";
  const getStyleState = (resourceId: string) => styleStateMap.value.get(resourceId) ?? StyleState.Default;
  const setDevice = (resourceId: string, device: PageBuilderDevice) => {
    deviceMap.value.set(resourceId, device);
  };
  const setEditingNodeId = (resourceId: string, nodeId: string) => {
    editingNodeIdMap.value.set(resourceId, nodeId);
  };
  const setSelectedNodeId = (resourceId: string, nodeId: string) => {
    selectedNodeIdMap.value.set(resourceId, nodeId);
  };
  const setStyleState = (resourceId: string, state: StyleState) => {
    styleStateMap.value.set(resourceId, state);
  };
  return {
    getDevice,
    getEditingNodeId,
    getSelectedNodeId,
    getStyleState,
    selectedNodeIdMap,
    setDevice,
    setEditingNodeId,
    setSelectedNodeId,
    setStyleState,
  };
});
