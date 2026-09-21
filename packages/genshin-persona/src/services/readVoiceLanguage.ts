import type { VoiceLanguage } from "#src/models/VoiceLanguage";

import { checkIsVoiceLanguage } from "#src/services/checkIsVoiceLanguage";
import { VOICE_LANGUAGE_PATH } from "#src/services/constants";
import { readStateFile } from "#src/services/readStateFile";

// The dub the `voice` verb chose, or nothing before it ran — which is the gate in front of every spoken reply
export const readVoiceLanguage = (): undefined | VoiceLanguage => {
  const language = readStateFile(VOICE_LANGUAGE_PATH);
  return checkIsVoiceLanguage(language) ? language : undefined;
};
