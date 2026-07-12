import type { MimeType } from "#shared/models/file/MimeType";

import { useNotificationStore } from "@/store/notification";
import { getResultAsync, noop, normalizeString } from "@esposter/shared";
import { showSaveFilePicker } from "show-open-file-picker";

export const useExportFile = () => {
  const notificationStore = useNotificationStore();
  const { createNotification } = notificationStore;
  return (
    serialize: (type: MimeType) => Promise<Blob>,
    fileName: string,
    mimeType: MimeType,
    accept: string,
  ): Promise<boolean> =>
    getResultAsync(async () => {
      const fileHandle = await showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            accept: { [mimeType]: accept.split(",").map((ext) => normalizeString(ext)) },
            description: (accept.split(",")[0] ?? "").replace(/^\./u, "").toUpperCase(),
          },
        ],
      });
      const blob = await serialize(mimeType);
      const writable = await fileHandle.createWritable();
      return { blob, writable };
    })
      .andThen(({ blob, writable }) =>
        getResultAsync(async () => {
          await writable.write(blob);
          await writable.close();
        }).orElse((error) =>
          getResultAsync(async () => {
            await getResultAsync(() => writable.abort()).match(noop, console.error);
            throw error;
          }),
        ),
      )
      .match(
        // A cancelled save picker is not a completed export, so it reports false without a notification
        () => true,
        (error) => {
          if (!(error instanceof Error && error.name === "AbortError"))
            createNotification({ severity: "error", title: error instanceof Error ? error.message : String(error) });
          return false;
        },
      );
};
