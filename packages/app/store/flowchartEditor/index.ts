import { FlowchartEditor } from "@/models/flowchartEditor/FlowchartEditor";
import { FLOWCHART_EDITOR_LOCAL_STORAGE_KEY } from "@/services/flowchartEditor/constants";
import { saveItemMetadata } from "@/services/shared/saveItemMetadata";

export const useFlowchartEditorStore = defineStore("flowchartEditor", () => {
  const { $client } = useNuxtApp();
  const { status } = useAuth();
  const flowchartEditor = ref(new FlowchartEditor());
  const saveFlowchartEditor = async () => {
    if (status.value === "authenticated") {
      saveItemMetadata(flowchartEditor.value);
      await $client.flowchartEditor.saveFlowchartEditor.mutate(flowchartEditor.value);
    } else if (status.value === "unauthenticated") {
      saveItemMetadata(flowchartEditor.value);
      localStorage.setItem(FLOWCHART_EDITOR_LOCAL_STORAGE_KEY, flowchartEditor.value.toJSON());
    }
  };
  return { flowchartEditor, saveFlowchartEditor };
});
