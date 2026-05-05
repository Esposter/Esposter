import type { MimeType } from "#shared/models/file/MimeType";

import { normalizeString, takeOne, toAppError } from "@esposter/shared";
import { useAlertStore } from "@/store/alert";
import { err, ok, ResultAsync } from "neverthrow";
import { showOpenFilePicker } from "show-open-file-picker";

export const useImportFile = () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  return (mimeType: MimeType, accept: string, onSelect: (file: File) => Promise<void>): ResultAsync<void, Error> =>
    ResultAsync.fromPromise(
      showOpenFilePicker({
        types: [
          {
            accept: { [mimeType]: accept.split(",").map((value) => normalizeString(value)) },
            description: (accept.split(",")[0] ?? "").replace(/^\./, "").toUpperCase(),
          },
        ],
      }),
      toAppError,
    )
      .andThen((handles) => ResultAsync.fromPromise(takeOne(handles).getFile(), toAppError))
      .andThen((file) => ResultAsync.fromPromise(onSelect(file), toAppError))
      .orElse((error) => {
        if (error.name === "AbortError") return ok(undefined);
        createAlert(error.message, "error");
        return err(error);
      });
};
