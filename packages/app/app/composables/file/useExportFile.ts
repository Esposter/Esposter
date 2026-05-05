import type { MimeType } from "#shared/models/file/MimeType";

import { useAlertStore } from "@/store/alert";
import { getResultAsync, noop, normalizeString } from "@esposter/shared";
import { showSaveFilePicker } from "show-open-file-picker";

export const useExportFile = () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  return (
    serialize: (type: MimeType) => Promise<Blob>,
    fileName: string,
    mimeType: MimeType,
    accept: string,
  ): Promise<void> =>
    getResultAsync(async () => {
      const blob = await serialize(mimeType);
      const fileHandle = await showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            accept: { [mimeType]: accept.split(",").map((ext) => normalizeString(ext)) },
            description: (accept.split(",")[0] ?? "").replace(/^\./, "").toUpperCase(),
          },
        ],
      });
      const writable = await fileHandle.createWritable();
      return { blob, writable };
    })
      .andThen(({ blob, writable }) =>
        getResultAsync(async () => {
          await writable.write(blob);
          await writable.close();
        }).orElse((error) =>
          getResultAsync(async () => {
            await getResultAsync(async () => writable.abort()).match(noop, console.error);
            throw error;
          }),
        ),
      )
      .match(noop, (error) => {
        if (error instanceof Error && error.name === "AbortError") return;
        createAlert(error instanceof Error ? error.message : String(error), "error");
      });
};
