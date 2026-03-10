import { exportFile } from "@/services/file/exportFile";
import { useAlertStore } from "@/store/alert";

export const useExportFile = () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  return async (
    serialize: (type: string) => Promise<Blob>,
    fileName: string,
    mimeType: string,
    accept: string,
  ): Promise<void> => {
    try {
      const blob = await serialize(mimeType);
      await exportFile(blob, fileName, mimeType, accept);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      createAlert(error instanceof Error ? error.message : String(error), "error");
    }
  };
};
