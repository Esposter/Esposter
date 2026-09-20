import { VOICE_DEVICE_PATH } from "#src/services/constants";
import { writeStateFile } from "#src/services/writeStateFile";

export const writeVoiceDevice = (name: string): void => {
  writeStateFile(VOICE_DEVICE_PATH, name);
};
