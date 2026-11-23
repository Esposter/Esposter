import { showOpenFilePicker } from "#src/services/file/showOpenFilePicker";
import { getResultAsync } from "@esposter/shared";

// The picker both the composer's upload button and its actions menu open, so the two cannot disagree about what a
// File selection means
export const pickFiles = async () => {
  const fileSystemFileHandles = await getResultAsync(() => showOpenFilePicker({ multiple: true }));
  // Cancelling rejects rather than resolving empty, and no error is worth telling apart from it: nothing was picked
  // Either way
  return fileSystemFileHandles.match(
    (handles) => Promise.all(handles.map((fileSystemFileHandle) => fileSystemFileHandle.getFile())),
    () => [],
  );
};
