import type { SoundStart } from "#src/models/genshinAssets/sound/SoundStart";

// Sounds of the game's played together as one effect: where in the recording the first starts, each sound's offset
// From it, and how much of the recording's window, in decibels, they leave unexplained
export interface SoundSet {
  residual: number;
  sounds: SoundStart[];
  startSeconds: number;
}
