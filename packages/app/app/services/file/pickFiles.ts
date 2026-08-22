import { showOpenFilePicker } from "show-open-file-picker";

// The picker both the composer's upload button and its actions menu open, so the two cannot disagree about what a
// File selection means
export const pickFiles = async () => {
  const fileSystemFileHandles = await showOpenFilePicker({ multiple: true });
  return Promise.all(fileSystemFileHandles.map((fileSystemFileHandle) => fileSystemFileHandle.getFile()));
};
