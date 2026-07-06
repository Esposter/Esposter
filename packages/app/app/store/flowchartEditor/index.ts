import { FlowchartEditor, flowchartEditorSchema } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { FLOWCHART_EDITOR_LOCAL_STORAGE_KEY } from "@/services/flowchartEditor/constants";

export const useFlowchartEditorStore = defineStore("flowchartEditor", () => {
  const { $trpc } = useNuxtApp();
  const {
    content: flowchartEditor,
    load,
    loadLocal,
    save: saveFlowchartEditor,
  } = useDocumentState(
    FlowchartEditor,
    {
      createDocument: (input) => $trpc.flowchartEditor.createDocument.mutate(input),
      deleteDocument: (input) => $trpc.flowchartEditor.deleteDocument.mutate(input),
      publishDocument: (input) => $trpc.flowchartEditor.publishDocument.mutate(input),
      readDocumentContent: (input) => $trpc.flowchartEditor.readDocumentContent.query(input),
      readDocuments: async () => (await $trpc.flowchartEditor.readDocuments.query()).items,
      saveDocumentContent: (input) => $trpc.flowchartEditor.saveDocumentContent.mutate(input),
      unpublishDocument: (input) => $trpc.flowchartEditor.unpublishDocument.mutate(input),
      updateDocument: (input) => $trpc.flowchartEditor.updateDocument.mutate(input),
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
