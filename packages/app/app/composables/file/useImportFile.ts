import type { MimeType } from "#shared/models/file/MimeType";

import { useAlertStore } from "@/store/alert";
import { getResultAsync, normalizeString, takeOne } from "@esposter/shared";
import { showOpenFilePicker } from "show-open-file-picker";

export const useImportFile = () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  return (mimeType: MimeType, accept: string, onSelect: (file: File) => Promise<void>): Promise<void> =>
    getResultAsync(async () => {
      const handles = await showOpenFilePicker({
        types: [
          {
            accept: { [mimeType]: accept.split(",").map((value) => normalizeString(value)) },
            description: (accept.split(",")[0] ?? "").replace(/^\./, "").toUpperCase(),
          },
        ],
      });
      const file = await takeOne(handles).getFile();
      await onSelect(file);
    }).match(
      () => undefined,
      (error) => {
        if (error instanceof Error && error.name === "AbortError") return;
        createAlert(error instanceof Error ? error.message : String(error), "error");
      },
    );
};
