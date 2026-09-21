import { checkIsVolume } from "#src/services/checkIsVolume";
import { MAX_VOLUME, VOLUME_PATH } from "#src/services/constants";
import { existsSync, readFileSync } from "node:fs";

// The top of the scale when no volume was set, or when the file holds anything but a whole number of the scale —
// Which leaves the engine's own level
export const readVolume = (): number => {
  const volume = existsSync(VOLUME_PATH) ? readFileSync(VOLUME_PATH, "utf8").trim() : "";
  return checkIsVolume(volume) ? Number(volume) : MAX_VOLUME;
};
