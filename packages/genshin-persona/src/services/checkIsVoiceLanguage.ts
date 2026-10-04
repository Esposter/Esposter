import type { VoiceLanguage } from "#src/models/VoiceLanguage";

import { VoiceLanguages } from "#src/models/VoiceLanguage";

export const checkIsVoiceLanguage = (value: string): value is VoiceLanguage => VoiceLanguages.includes(value);
