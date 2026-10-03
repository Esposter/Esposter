import type { MusicNote } from "#src/audio/MusicNote";
import type { MusicVoice } from "#src/audio/MusicVoice";

// A note at its time in the playlist, in seconds from the first pass's start, with the voice that plays it
export interface ScheduledMusicNote {
  note: MusicNote;
  time: number;
  voice: MusicVoice;
}
