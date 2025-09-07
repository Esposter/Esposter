import { FlowchartEditor } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { FLOWCHART_EDITOR_LOCAL_STORAGE_KEY } from "@/services/flowchartEditor/constants";
import { useFlowchartEditorStore } from "@/store/flowchartEditor";

export const useReadFlowchartEditor = async () => {
  const { $trpc } = useNuxtApp();
  const flowchartEditorStore = useFlowchartEditorStore();
  const { flowchartEditor } = storeToRefs(flowchartEditorStore);
  await useReadData(
    () => {
      const flowchartEditorJson = localStorage.getItem(FLOWCHART_EDITOR_LOCAL_STORAGE_KEY);
      flowchartEditor.value = flowchartEditorJson
        ? new FlowchartEditor(jsonDateParse(flowchartEditorJson))
        : new FlowchartEditor();
    },
    async () => {
      flowchartEditor.value = await $trpc.flowchartEditor.readFlowchartEditor.query();
    },
  );
};
