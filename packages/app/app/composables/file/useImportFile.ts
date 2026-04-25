import type { MimeType } from "#shared/models/file/MimeType";

import { useAlertStore } from "@/store/alert";
import { takeOne } from "@esposter/shared";
import { showOpenFilePicker } from "show-open-file-picker";

export const useImportFile = () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  return async (mimeType: MimeType, accept: string, onSelect: (file: File) => Promise<void>): Promise<void> => {
    try {
      const fileHandle = takeOne(
        await showOpenFilePicker({
          types: [
            {
              accept: { [mimeType]: accept.split(",").map((ext) => ext.trim()) },
              description: (accept.split(",")[0] ?? "").replace(/^\./, "").toUpperCase(),
            },
          ],
        }),
      );
      const file = await fileHandle.getFile();
      await onSelect(file);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      createAlert(error instanceof Error ? error.message : String(error), "error");
    }
  };
};
