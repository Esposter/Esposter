import { useAlertStore } from "@/store/alert";
import { showSaveFilePicker } from "show-open-file-picker";

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
      const fileHandle = await showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            accept: { [mimeType]: accept.split(",").map((ext) => ext.trim()) },
            description: (accept.split(",")[0] ?? "").replace(/^\./, "").toUpperCase(),
          },
        ],
      });
      const writable = await fileHandle.createWritable();
      try {
        await writable.write(blob);
        await writable.close();
      } catch (error) {
        await writable.abort();
        throw error;
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      createAlert(error instanceof Error ? error.message : String(error), "error");
    }
  };
};
