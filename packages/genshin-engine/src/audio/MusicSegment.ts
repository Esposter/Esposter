import type { MusicVoice } from "#src/audio/MusicVoice";

// A stretch of music played whole, its length in seconds and its voices, none for a rest
export interface MusicSegment {
  duration: number;
  voices: MusicVoice[];
}
