import type { MusicVoice } from "#src/audio/MusicVoice";

// A stretch of music played whole, its length in seconds and its voices, none for a rest, with its expression: the gain
// In decibels over every voice at the centre of each `MUSIC_EXPRESSION_WINDOW_SECONDS` from its start, moving evenly in
// Decibels between them as an expression controller swells and fades a whole section, none to play at unity
export interface MusicSegment {
  duration: number;
  expression: number[];
  voices: MusicVoice[];
}
