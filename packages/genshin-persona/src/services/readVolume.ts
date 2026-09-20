import { checkIsVolume } from "#src/services/checkIsVolume";
import { MAX_VOLUME, VOLUME_PATH } from "#src/services/constants";
import { existsSync, readFileSync } from "node:fs";

// The top of the scale when no volume was set, or when the file holds one of the levels the speech markup once
// Named — which leaves the engine's own level
export const readVolume = (): number => {
  const volume = existsSync(VOLUME_PATH) ? readFileSync(VOLUME_PATH, "utf8").trim() : "";
  return checkIsVolume(volume) ? Number(volume) : MAX_VOLUME;
};
