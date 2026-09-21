import type { ReplyPiece } from "#src/models/ReplyPiece";
import type { VoiceLanguage } from "#src/models/VoiceLanguage";
import type { VoiceRequestType } from "#src/models/VoiceRequestType";

// A request that reads a character's reference: spoken, or only warmed
export interface SpeechRequest extends ReplyPiece {
  language: VoiceLanguage;
  // Read in order, each synthesized whole: a piece's spoken lines — none for a piece with no blockquote line, which
  // Is sent all the same so the piece after it is not waited for — or the one word a warm synthesizes
  lines: string[];
  // The character whose reference reads the lines
  name: string;
  // The reference line's wiki file stem; "" when neither the card nor the generated map names one, and the
  // Longest story line the wiki lists stands in
  stem: string;
  type: typeof VoiceRequestType.Speak | typeof VoiceRequestType.Warm;
  // A whole number of the volume scale, applied as a gain on the samples
  volume: number;
}
