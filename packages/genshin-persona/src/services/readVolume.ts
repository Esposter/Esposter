import { checkIsVolume } from "#src/services/checkIsVolume";
import { MAX_VOLUME, VOLUME_PATH } from "#src/services/constants";
import { readStateFile } from "#src/services/readStateFile";

// The top of the scale when no volume was set, or when the file holds anything but a whole number of the scale —
// Which leaves the engine's own level
export const readVolume = (): number => {
  const volume = readStateFile(VOLUME_PATH);
  return checkIsVolume(volume) ? Number(volume) : MAX_VOLUME;
};
