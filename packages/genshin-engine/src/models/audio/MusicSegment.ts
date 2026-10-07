import type { MusicVoice } from "#src/models/audio/MusicVoice";

// A stretch of music played whole, its length in seconds and its voices, none for a rest, with its expression: the gain
// In decibels over every voice at the centre of each `MUSIC_EXPRESSION_WINDOW_SECONDS` from its start, moving evenly in
// Decibels between them as an expression controller swells and fades a whole section, none to play at unity. Its volume
// Is the decibels the game's mix plays it at over the sound its notes and expression recreate, which the live player
// Applies and a render scored against that sound leaves out
export interface MusicSegment {
  duration: number;
  expression: number[];
  voices: MusicVoice[];
  volume: number;
}
