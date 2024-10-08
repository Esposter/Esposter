import { FlowchartEditor } from "@/models/flowchartEditor/FlowchartEditor";
import { FLOWCHART_EDITOR_LOCAL_STORAGE_KEY } from "@/services/flowchartEditor/constants";
import { useFlowchartEditorStore } from "@/store/flowchartEditor";
import { jsonDateParse } from "@/util/time/jsonDateParse";

export const useReadFlowchartEditor = async () => {
  const { $client } = useNuxtApp();
  const flowchartEditorStore = useFlowchartEditorStore();
  const { flowchartEditor } = storeToRefs(flowchartEditorStore);
  await useReadData(
    () => {
      const flowchartEditorJson = localStorage.getItem(FLOWCHART_EDITOR_LOCAL_STORAGE_KEY);
      if (flowchartEditorJson)
        flowchartEditor.value = Object.assign(new FlowchartEditor(), jsonDateParse(flowchartEditorJson));
      else flowchartEditor.value = new FlowchartEditor();
    },
    async () => {
      flowchartEditor.value = await $client.flowchartEditor.readFlowchartEditor.query();
    },
  );
};
