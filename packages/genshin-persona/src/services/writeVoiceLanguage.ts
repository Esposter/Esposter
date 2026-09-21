import type { VoiceLanguage } from "#src/models/VoiceLanguage";

import { VOICE_LANGUAGE_PATH } from "#src/services/constants";
import { writeStateFile } from "#src/services/writeStateFile";

export const writeVoiceLanguage = (language: VoiceLanguage): void => {
  writeStateFile(VOICE_LANGUAGE_PATH, language);
};
