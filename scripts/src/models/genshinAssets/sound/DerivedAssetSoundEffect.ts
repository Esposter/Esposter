import type { SoundStart } from "#src/models/genshinAssets/sound/SoundStart";

// A component's sound effect as its fit keeps it: the pattern of the game's package names its sounds are matched in, and
// The sounds the match found, each by its id and when it starts within the effect
export interface DerivedAssetSoundEffect {
  pattern: string;
  sounds: readonly SoundStart[];
}
