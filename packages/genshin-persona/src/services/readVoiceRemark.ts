import type { LocalizationStrings } from "#src/models/LocalizationStrings";

import { checkIsMuted } from "#src/services/checkIsMuted";
import { readVoiceDevice } from "#src/services/readVoiceDevice";
import { readVoiceLanguage } from "#src/services/readVoiceLanguage";
import { readVolume } from "#src/services/readVolume";

// One line of the welcome about the voice, off the state files alone, and "" until the voice verb has set a dub
// Up: a person who never ran it has nothing to be told about
export const readVoiceRemark = (strings: LocalizationStrings): string => {
  const dub = readVoiceLanguage();
  return dub ? strings.voiceRemark(dub, readVoiceDevice(), checkIsMuted(), readVolume()) : "";
};
