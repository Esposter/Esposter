import { VOICE_DEVICE_PATH } from "#src/services/constants";
import { rmSync } from "node:fs";

export const deleteVoiceDevice = (): void => {
  rmSync(VOICE_DEVICE_PATH, { force: true });
};
