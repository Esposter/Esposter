import { FlowchartEditor } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { authClient } from "@/services/auth/authClient";
import { FLOWCHART_EDITOR_LOCAL_STORAGE_KEY } from "@/services/flowchartEditor/constants";
import { saveItemMetadata } from "@/services/shared/saveItemMetadata";

export const useFlowchartEditorStore = defineStore("flowchartEditor", () => {
  const { $client } = useNuxtApp();
  const flowchartEditor = ref(new FlowchartEditor());
  const saveFlowchartEditor = async () => {
    const { data: session } = await authClient.useSession(useFetch);

    if (session.value) {
      saveItemMetadata(flowchartEditor.value);
      await $client.flowchartEditor.saveFlowchartEditor.mutate(flowchartEditor.value);
    } else {
      saveItemMetadata(flowchartEditor.value);
      localStorage.setItem(FLOWCHART_EDITOR_LOCAL_STORAGE_KEY, flowchartEditor.value.toJSON());
    }
  };
  return { flowchartEditor, saveFlowchartEditor };
});
