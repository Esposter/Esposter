import type { Instrument } from "#src/audio/Instrument";
import type { MusicNote } from "#src/audio/MusicNote";

// The notes one instrument plays within a segment
export interface MusicVoice {
  instrument: Instrument;
  notes: MusicNote[];
}
