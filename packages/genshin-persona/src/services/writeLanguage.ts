import type { VoiceLanguage } from "#src/models/VoiceLanguage";

import { LANGUAGE_PATH } from "#src/services/constants";
import { writeStateFile } from "#src/services/writeStateFile";

export const writeLanguage = (language: VoiceLanguage): void => {
  writeStateFile(LANGUAGE_PATH, language);
};
