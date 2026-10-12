import { writeJsonFile } from "#src/services/shared/writeJsonFile";

// A kit's overlay file is always written, `{}` where its overlay is empty, so every kit keeps its file and the
// citations of its docs page still resolve
export const writeKitOverlay = (overlayPath: string, overlay: object): void => {
  writeJsonFile(overlayPath, overlay);
};
