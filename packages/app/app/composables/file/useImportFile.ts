import type { MimeType } from "#shared/models/file/MimeType";

import { getFilePickerTypes } from "@/services/file/getFilePickerTypes";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { getResultAsync, noop, takeOne } from "@esposter/shared";
import { showOpenFilePicker } from "show-open-file-picker";

export const useImportFile =
  () =>
  (mimeType: MimeType, accept: string, onSelect: (file: File) => Promise<void>): Promise<void> =>
    getResultAsync(async () => {
      const handles = await showOpenFilePicker({ types: getFilePickerTypes(mimeType, accept) });
      const file = await takeOne(handles).getFile();
      await onSelect(file);
    }).match(noop, (error) => {
      // Dismissing the picker rejects like a failure and is not one
      if (error.name === "AbortError") return;

      createErrorAlert(error);
    });
