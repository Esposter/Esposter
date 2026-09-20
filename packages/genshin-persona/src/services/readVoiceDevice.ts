import { VOICE_DEVICE_LADDER, VOICE_DEVICE_PATH } from "#src/services/constants";
import { existsSync, readFileSync } from "node:fs";

// The rung of the device ladder the last synthesizer on this machine spoke on, or "" before one has — or when the
// File names a rung the ladder no longer has
export const readVoiceDevice = (): string => {
  const name = existsSync(VOICE_DEVICE_PATH) ? readFileSync(VOICE_DEVICE_PATH, "utf8").trim() : "";
  return VOICE_DEVICE_LADDER.some((rung) => rung.name === name) ? name : "";
};
