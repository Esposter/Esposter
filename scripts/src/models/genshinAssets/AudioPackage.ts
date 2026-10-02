import type { AudioPackageEntry } from "#src/models/genshinAssets/AudioPackageEntry";

// What a Wwise audio package holds: its sound banks and its streamed sounds
export interface AudioPackage {
  banks: AudioPackageEntry[];
  sounds: AudioPackageEntry[];
}
