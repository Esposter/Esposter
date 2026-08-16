import type { ResourceType } from "@esposter/db-schema";

import { FlowchartEditor } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { createContentData } from "@/services/resource/createContentData";

export const useFlowchartEditorStore = defineStore("flowchartEditor", () => {
  const {
    content: flowchartEditor,
    loadContent,
    // The canvas emits per drag frame, so the debounced autosave asks to save graphs nobody changed and the
    // Dirty check is what drops them — stamping the content's own `updatedAt` here would make every one of
    // Them differ. The modified time the explorer reads is the resource row's, which the server bumps per write
    saveContent: saveFlowchartEditor,
  } = createContentData<ResourceType.Flowchart, FlowchartEditor>((data) => new FlowchartEditor(data));
  const selectedNodes = computed(() => flowchartEditor.value.nodes.filter(({ selected }) => selected));
  const isSingleNodeSelected = computed(() => selectedNodes.value.length === 1);
  // The node palette renders as an on-canvas panel inside the Editor blade (no app drawer to host it)
  const isSidebarOpen = ref(false);
  return { flowchartEditor, isSidebarOpen, isSingleNodeSelected, loadContent, saveFlowchartEditor, selectedNodes };
});
