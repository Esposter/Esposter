import { useFlowchartEditorStore } from "@/store/flowchartEditor";

export const useReadFlowchartEditor = async () => {
  const flowchartEditorStore = useFlowchartEditorStore();
  const { load, loadLocal } = flowchartEditorStore;
  await useReadData(loadLocal, load);
};
