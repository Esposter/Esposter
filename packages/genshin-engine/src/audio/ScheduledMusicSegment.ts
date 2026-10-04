import type { MusicSegment } from "#src/audio/MusicSegment";

// A segment at its start in the playlist, in seconds from the first pass's start
export interface ScheduledMusicSegment {
  segment: MusicSegment;
  start: number;
}
