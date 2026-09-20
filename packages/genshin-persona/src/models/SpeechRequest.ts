import type { VoiceLanguage } from "#src/models/VoiceLanguage";
import type { VoiceRequestType } from "#src/models/VoiceRequestType";

// A request that reads a character's reference: spoken, or only warmed
export interface SpeechRequest {
  language: VoiceLanguage;
  // The character whose reference reads the text
  name: string;
  // The reference line's wiki file stem; "" when neither the card nor the generated map names one, and the
  // Longest story line the wiki lists stands in
  stem: string;
  // "" for a warm request, which speaks nothing
  text: string;
  type: typeof VoiceRequestType.Speak | typeof VoiceRequestType.Warm;
  // A whole number of the volume scale, applied as a gain on the samples
  volume: number;
}
