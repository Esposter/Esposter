import type { VoiceLanguage } from "#src/models/VoiceLanguage";
import type { VoiceRequestType } from "#src/models/VoiceRequestType";

// A request that reads a character's reference: spoken, or only warmed
export interface SpeechRequest {
  language: VoiceLanguage;
  // Read in order, each synthesized whole: a reply's spoken lines, or the one line a warm synthesizes and keeps
  lines: string[];
  // The character whose reference reads the lines
  name: string;
  // The reference line's wiki file stem; "" when neither the card nor the generated map names one, and the
  // Longest story line the wiki lists stands in
  stem: string;
  // The reply's turn, so its lines queue behind one another and a newer turn's replace them; "" for a warm and
  // For the proof the `voice` verb speaks
  turnId: string;
  type: typeof VoiceRequestType.Speak | typeof VoiceRequestType.Warm;
  // A whole number of the volume scale, applied as a gain on the samples
  volume: number;
}
