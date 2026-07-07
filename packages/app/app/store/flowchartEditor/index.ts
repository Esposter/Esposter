import { FlowchartEditor, flowchartEditorSchema } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { FLOWCHART_EDITOR_LOCAL_STORAGE_KEY } from "@/services/flowchartEditor/constants";
import { MAX_READ_LIMIT } from "@esposter/shared";

export const useFlowchartEditorStore = defineStore("flowchartEditor", () => {
  const { $trpc } = useNuxtApp();
  const {
    content: flowchartEditor,
    load,
    loadLocal,
    save: saveFlowchartEditor,
  } = useResourceState(
    FlowchartEditor,
    {
      createResource: (input) => $trpc.flowchartEditor.createResource.mutate(input),
      deleteResource: (input) => $trpc.flowchartEditor.deleteResource.mutate(input),
      readResourceContent: (input) => $trpc.flowchartEditor.readResourceContent.query(input),
      readResources: async () => (await $trpc.flowchartEditor.readResources.query({ limit: MAX_READ_LIMIT })).items,
      saveResourceContent: (input) => $trpc.flowchartEditor.saveResourceContent.mutate(input),
      updateResource: (input) => $trpc.flowchartEditor.updateResource.mutate(input),
    },
    {
      defaultName: "My Flowchart",
      localStorageKey: FLOWCHART_EDITOR_LOCAL_STORAGE_KEY,
      schema: flowchartEditorSchema,
    },
  );
  const selectedNodes = computed(() => flowchartEditor.value.nodes.filter(({ selected }) => selected));
  const isSingleNodeSelected = computed(() => selectedNodes.value.length === 1);
  return { flowchartEditor, isSingleNodeSelected, load, loadLocal, saveFlowchartEditor, selectedNodes };
});
