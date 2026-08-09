import type { ResourceType } from "@esposter/db-schema";

import { FlowchartEditor } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { useResourceStore } from "@/store/resource";

export const useFlowchartEditorStore = defineStore("flowchartEditor", () => {
  const resourceStore = useResourceStore();
  const { readContent, readResource, saveContent, setPersistedContent } = resourceStore;
  // Cast avoids the excessively deep UnwrapRef instantiation on the nested graph node/edge types
  const flowchartEditor = ref(new FlowchartEditor()) as Ref<FlowchartEditor>;
  const loadContent = async () => {
    await readResource();
    const data = await readContent<ResourceType.Flowchart>();
    flowchartEditor.value = new FlowchartEditor(data);
    // Seed the dirty check so the canvas's mount-time node echo compares equal instead of writing back
    setPersistedContent(flowchartEditor.value);
  };
  // The canvas emits per drag frame, so the debounced autosave asks to save graphs nobody changed and the
  // Dirty check is what drops them — stamping the content's own `updatedAt` here would make every one of
  // Them differ. The modified time the explorer reads is the resource row's, which the server bumps per write
  const saveFlowchartEditor = () => saveContent(flowchartEditor.value);
  const selectedNodes = computed(() => flowchartEditor.value.nodes.filter(({ selected }) => selected));
  const isSingleNodeSelected = computed(() => selectedNodes.value.length === 1);
  // The node palette renders as an on-canvas panel inside the Editor blade (no app drawer to host it)
  const isSidebarOpen = ref(false);
  return { flowchartEditor, isSidebarOpen, isSingleNodeSelected, loadContent, saveFlowchartEditor, selectedNodes };
});
