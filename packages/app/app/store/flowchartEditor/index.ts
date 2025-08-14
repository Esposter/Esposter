import { FlowchartEditor } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { authClient } from "@/services/auth/authClient";
import { FLOWCHART_EDITOR_LOCAL_STORAGE_KEY } from "@/services/flowchartEditor/constants";
import { saveItemMetadata } from "@/services/shared/metadata/saveItemMetadata";

export const useFlowchartEditorStore = defineStore("flowchartEditor", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const flowchartEditor = ref(new FlowchartEditor());
  const saveFlowchartEditor = async () => {
    if (session.value.data) {
      saveItemMetadata(flowchartEditor.value);
      await $trpc.flowchartEditor.saveFlowchartEditor.mutate(flowchartEditor.value);
    } else {
      saveItemMetadata(flowchartEditor.value);
      localStorage.setItem(FLOWCHART_EDITOR_LOCAL_STORAGE_KEY, flowchartEditor.value.toJSON());
    }
  };
  // @ts-expect-error Type instantiation is excessively deep and possibly infinite. ts(2589)
  const selectedNodes = computed(() => flowchartEditor.value.nodes.filter(({ selected }) => selected));
  const isSingleNodeSelected = computed(() => selectedNodes.value.length === 1);
  return { flowchartEditor, isSingleNodeSelected, saveFlowchartEditor, selectedNodes };
});
