import { VOICE_DEVICE_PATH } from "#src/services/constants";
import { getVoiceDeviceLadder } from "#src/services/getVoiceDeviceLadder";
import { readStateFile } from "#src/services/readStateFile";

// The rung of the device ladder the last synthesizer on this machine spoke on, or "" before one has — or when the
// File names a rung the ladder no longer has
export const readVoiceDevice = (): string => {
  const name = readStateFile(VOICE_DEVICE_PATH);
  return getVoiceDeviceLadder().some((rung) => rung.name === name) ? name : "";
};
