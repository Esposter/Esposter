import type { InterfaceClipProperty } from "#src/models/InterfaceClipProperty";

// One of the game's interface animation clips as a screen plays it: its span, and a track for each property it moves
// On each piece, the piece named by its path under the screen's interface root (empty for the root itself) and each
// Keyframe an offset through the clip and a value
export interface InterfaceClip {
  durationMs: number;
  tracks: { keyframes: [number, number][]; property: InterfaceClipProperty; target: string }[];
}
