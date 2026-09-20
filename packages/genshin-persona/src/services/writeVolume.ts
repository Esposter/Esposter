import { VOLUME_PATH } from "#src/services/constants";
import { writeStateFile } from "#src/services/writeStateFile";

export const writeVolume = (volume: string): void => {
  writeStateFile(VOLUME_PATH, volume);
};
