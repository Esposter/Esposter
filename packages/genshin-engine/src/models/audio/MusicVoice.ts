import type { Instrument } from "#src/models/audio/Instrument";
import type { MusicNote } from "#src/models/audio/MusicNote";

// The notes one instrument plays within a segment
export interface MusicVoice {
  instrument: Instrument;
  notes: MusicNote[];
}
