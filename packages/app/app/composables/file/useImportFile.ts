import { importFile } from "@/services/file/importFile";
import { useAlertStore } from "@/store/alert";

export const useImportFile = () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  return async (mimeType: string, accept: string, onSelect: (file: File) => Promise<void>): Promise<void> => {
    try {
      const file = await importFile(mimeType, accept);
      await onSelect(file);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      createAlert(error instanceof Error ? error.message : String(error), "error");
    }
  };
};
