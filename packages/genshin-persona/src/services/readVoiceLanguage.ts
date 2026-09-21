import type { VoiceLanguage } from "#src/models/VoiceLanguage";

import { checkIsVoiceLanguage } from "#src/services/checkIsVoiceLanguage";
import { VOICE_LANGUAGE_PATH } from "#src/services/constants";
import { existsSync, readFileSync } from "node:fs";

// The dub the `voice` verb chose, or nothing before it ran — which is the gate in front of every spoken reply
export const readVoiceLanguage = (): undefined | VoiceLanguage => {
  const language = existsSync(VOICE_LANGUAGE_PATH) ? readFileSync(VOICE_LANGUAGE_PATH, "utf8").trim() : "";
  return checkIsVoiceLanguage(language) ? language : undefined;
};
