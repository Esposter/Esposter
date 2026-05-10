import { FlowchartEditor, flowchartEditorSchema } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { FLOWCHART_EDITOR_LOCAL_STORAGE_KEY } from "@/services/flowchartEditor/constants";

export const useFlowchartEditorStore = defineStore("flowchartEditor", () => {
  const { $trpc } = useNuxtApp();
  const flowchartEditor = ref(new FlowchartEditor());
  const saveFlowchartEditor = useSave(flowchartEditor, {
    auth: { save: $trpc.flowchartEditor.saveFlowchartEditor.mutate },
    unauth: { key: FLOWCHART_EDITOR_LOCAL_STORAGE_KEY, schema: flowchartEditorSchema },
  });
  // @ts-expect-error TS2589: Type instantiation is excessively deep and possibly infinite.
  const selectedNodes = computed(() => flowchartEditor.value.nodes.filter(({ selected }) => selected));
  const isSingleNodeSelected = computed(() => selectedNodes.value.length === 1);
  return { flowchartEditor, isSingleNodeSelected, saveFlowchartEditor, selectedNodes };
});
