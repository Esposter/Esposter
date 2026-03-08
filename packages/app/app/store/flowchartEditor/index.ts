import { FlowchartEditor, flowchartEditorSchema } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { authClient } from "@/services/auth/authClient";
import { FLOWCHART_EDITOR_LOCAL_STORAGE_KEY } from "@/services/flowchartEditor/constants";
import { saveItemMetadata } from "@/services/shared/metadata/saveItemMetadata";

export const useFlowchartEditorStore = defineStore("flowchartEditor", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const saveToLocalStorage = useSaveToLocalStorage();
  const flowchartEditor = ref(new FlowchartEditor());
  const saveFlowchartEditor = async () => {
    saveItemMetadata(flowchartEditor.value);
    if (session.value.data) await $trpc.flowchartEditor.saveFlowchartEditor.mutate(flowchartEditor.value);
    else saveToLocalStorage(FLOWCHART_EDITOR_LOCAL_STORAGE_KEY, flowchartEditorSchema, flowchartEditor.value);
  };
  // @ts-expect-error TS2589: Type instantiation is excessively deep and possibly infinite.
  const selectedNodes = computed(() => flowchartEditor.value.nodes.filter(({ selected }) => selected));
  const isSingleNodeSelected = computed(() => selectedNodes.value.length === 1);
  return { flowchartEditor, isSingleNodeSelected, saveFlowchartEditor, selectedNodes };
});
