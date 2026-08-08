import type { ResourceType } from "@esposter/db-schema";

import { FlowchartEditor } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { saveItemMetadata } from "@/services/shared/metadata/saveItemMetadata";
import { getRouteParamString } from "@/util/router/getRouteParamString";

export const useFlowchartEditorStore = defineStore("flowchartEditor", () => {
  const route = useRoute();
  // The store outlives the page, so the id is read from the route per call rather than captured once
  const { load, readContent, save } = useResource<ResourceType.Flowchart>(() => getRouteParamString(route.params.id));
  // Cast avoids the excessively deep UnwrapRef instantiation on the nested graph node/edge types
  const flowchartEditor = ref(new FlowchartEditor()) as Ref<FlowchartEditor>;
  const loadContent = async () => {
    await load();
    const data = await readContent();
    flowchartEditor.value = new FlowchartEditor(data ?? undefined);
  };
  const saveFlowchartEditor = () => {
    saveItemMetadata(flowchartEditor.value);
    return save(flowchartEditor.value);
  };
  const selectedNodes = computed(() => flowchartEditor.value.nodes.filter(({ selected }) => selected));
  const isSingleNodeSelected = computed(() => selectedNodes.value.length === 1);
  // The node palette renders as an on-canvas panel inside the Editor blade (no app drawer to host it)
  const isSidebarOpen = ref(false);
  return { flowchartEditor, isSidebarOpen, isSingleNodeSelected, loadContent, saveFlowchartEditor, selectedNodes };
});
