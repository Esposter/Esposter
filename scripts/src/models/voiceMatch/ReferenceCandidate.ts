import type { ClipProfile } from "#src/models/voiceMatch/ClipProfile";
import type { PcmClip } from "@esposter/genshin-persona/src/models/PcmClip.ts";

// One of a character's lines as a reference could be chosen from it: its measurement, its stem, and the clip at
// The engine's rate, kept so the chosen one is cloned from without a second fetch
export interface ReferenceCandidate extends ClipProfile {
  clip: PcmClip;
  stem: string;
}
