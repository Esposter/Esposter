import { VOICE_DEVICE_LADDER, VOICE_DEVICE_PATH } from "#src/services/constants";
import { readStateFile } from "#src/services/readStateFile";

// The rung of the device ladder the last synthesizer on this machine spoke on, or "" before one has — or when the
// File names a rung the ladder no longer has
export const readVoiceDevice = (): string => {
  const name = readStateFile(VOICE_DEVICE_PATH);
  return VOICE_DEVICE_LADDER.some((rung) => rung.name === name) ? name : "";
};
