import { getResultAsync } from "@esposter/shared";
import { showOpenFilePicker } from "show-open-file-picker";

// The picker both the composer's upload button and its actions menu open, so the two cannot disagree about what a
// File selection means. Cancelling rejects rather than resolving empty — and the ponyfill rejects with a
// DOMException the native one does not, so no error is worth telling apart: nothing was picked either way
export const pickFiles = async () => {
  const fileSystemFileHandles = await getResultAsync(() => showOpenFilePicker({ multiple: true }));
  return fileSystemFileHandles.match(
    (handles) => Promise.all(handles.map((fileSystemFileHandle) => fileSystemFileHandle.getFile())),
    () => [],
  );
};
