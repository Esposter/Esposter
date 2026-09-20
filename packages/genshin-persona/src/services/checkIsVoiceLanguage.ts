import { VoiceLanguage } from "#src/models/VoiceLanguage";

// Widened off the as-const union, so a string typed by a person or read off a request can be looked up in it
const VOICE_LANGUAGES: string[] = Object.values(VoiceLanguage);

export const checkIsVoiceLanguage = (value: string): value is VoiceLanguage => VOICE_LANGUAGES.includes(value);
