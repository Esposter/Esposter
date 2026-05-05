import type { MimeType } from "#shared/models/file/MimeType";

import { getResultAsync } from "#shared/error/getResultAsync";
import { useAlertStore } from "@/store/alert";
import { normalizeString, takeOne } from "@esposter/shared";
import { showOpenFilePicker } from "show-open-file-picker";

export const useImportFile = () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  return (mimeType: MimeType, accept: string, onSelect: (file: File) => Promise<void>): Promise<void> =>
    getResultAsync(() =>
      showOpenFilePicker({
        types: [
          {
            accept: { [mimeType]: accept.split(",").map((value) => normalizeString(value)) },
            description: (accept.split(",")[0] ?? "").replace(/^\./, "").toUpperCase(),
          },
        ],
      }),
    )
      .andThen((handles) => getResultAsync(() => takeOne(handles).getFile()))
      .andThen((file) => getResultAsync(() => onSelect(file)))
      .match(
        () => undefined,
        (error) => {
          if (error instanceof Error && error.name === "AbortError") return;
          createAlert(error instanceof Error ? error.message : String(error), "error");
        },
      );
};
