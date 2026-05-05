import type { MimeType } from "#shared/models/file/MimeType";

import { getResultAsync } from "#shared/error/getResultAsync";
import { useAlertStore } from "@/store/alert";
import { normalizeString } from "@esposter/shared";
import { err } from "neverthrow";
import { showSaveFilePicker } from "show-open-file-picker";

export const useExportFile = () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  return async (
    serialize: (type: MimeType) => Promise<Blob>,
    fileName: string,
    mimeType: MimeType,
    accept: string,
  ): Promise<void> => {
    const exportResult = await getResultAsync(() => serialize(mimeType))
      .andThen((blob) =>
        getResultAsync(() =>
          showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                accept: { [mimeType]: accept.split(",").map((ext) => normalizeString(ext)) },
                description: (accept.split(",")[0] ?? "").replace(/^\./, "").toUpperCase(),
              },
            ],
          }),
        ).map((fileHandle) => ({ blob, fileHandle })),
      )
      .andThen(({ blob, fileHandle }) =>
        getResultAsync(() => fileHandle.createWritable()).map((writable) => ({ blob, writable })),
      )
      .andThen(({ blob, writable }) =>
        getResultAsync(async () => {
          await writable.write(blob);
          await writable.close();
        }).orElse((error) =>
          getResultAsync(() => writable.abort())
            .orTee(console.error)
            .andThen(() => err(error)),
        ),
      );
    exportResult.match(
      () => undefined,
      (error) => {
        if (error instanceof Error && error.name === "AbortError") return;
        createAlert(error instanceof Error ? error.message : String(error), "error");
      },
    );
  };
};
