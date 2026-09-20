import { MUTED_PATH } from "#src/services/constants";
import { writeStateFile } from "#src/services/writeStateFile";
import { rmSync } from "node:fs";

export const setIsMuted = (isMuted: boolean): void => {
  if (isMuted) writeStateFile(MUTED_PATH, "");
  else rmSync(MUTED_PATH, { force: true });
};
