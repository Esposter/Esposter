import type { MusicSegment } from "#src/audio/MusicSegment";

// A piece of music as a playlist: its segments, the order one pass plays them in as indices into them, so a segment
// Played twice is held once, and whether the passes repeat forever
export interface Music {
  isLooping: boolean;
  order: number[];
  segments: MusicSegment[];
}
