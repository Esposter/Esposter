import type { VoiceProfile } from "#src/models/voiceMatch/VoiceProfile";

// One catalogue voice, measured once over the carrier sentence and reused for every character
export interface CandidateVoice {
  name: string;
  profile: VoiceProfile;
  styles: string[];
  // How much of the carrier an English transcriber got back, which is the intelligibility gate
  wordErrorRate: number;
}
